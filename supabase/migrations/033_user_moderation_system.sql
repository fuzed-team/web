-- Migration: User Moderation System
-- Created: 2025-11-29
-- Description: Adds account suspension, deletion tracking, and user flagging system

-- ============================================
-- 1. Add status and suspension fields to profiles table
-- ============================================
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'suspended', 'deleted'));
        
        COMMENT ON COLUMN public.profiles.status IS 'Account status: active (default), suspended (cannot access), or deleted (soft delete)';
    END IF;

    -- Add suspension tracking fields
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'suspended_at'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN suspended_at TIMESTAMPTZ NULL,
        ADD COLUMN suspended_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        ADD COLUMN suspension_reason TEXT NULL;
        
        COMMENT ON COLUMN public.profiles.suspended_at IS 'Timestamp when account was suspended';
        COMMENT ON COLUMN public.profiles.suspended_by IS 'Admin user who suspended this account';
        COMMENT ON COLUMN public.profiles.suspension_reason IS 'Reason provided for account suspension';
    END IF;
END $$;

-- Create index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status) WHERE status != 'active';

-- ============================================
-- 2. Create user_flags table
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Prevent duplicate flags from same reporter to same user
    CONSTRAINT unique_flag_per_reporter UNIQUE (reporter_id, reported_user_id)
);

COMMENT ON TABLE public.user_flags IS 'User-reported flags for inappropriate behavior';
COMMENT ON COLUMN public.user_flags.reporter_id IS 'User who created the flag';
COMMENT ON COLUMN public.user_flags.reported_user_id IS 'User being reported';
COMMENT ON COLUMN public.user_flags.reason IS 'Reason for flagging this user';
COMMENT ON COLUMN public.user_flags.status IS 'Flag status: pending (needs review), reviewed (admin reviewed), dismissed (not valid)';
COMMENT ON COLUMN public.user_flags.reviewed_by IS 'Admin user who reviewed this flag';

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_flags_reported_user ON public.user_flags(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_flags_status ON public.user_flags(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_user_flags_created_at ON public.user_flags(created_at DESC);

-- ============================================
-- 3. Enable RLS on user_flags table
-- ============================================
ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view flags they created
CREATE POLICY "Users can view their own flags"
    ON public.user_flags
    FOR SELECT
    USING (
        auth.uid() = reporter_id
    );

-- Policy: Admins can view all flags
CREATE POLICY "Admins can view all flags"
    ON public.user_flags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy: Users can create flags for other users (not themselves)
CREATE POLICY "Users can create flags for others"
    ON public.user_flags
    FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id
        AND auth.uid() != reported_user_id
    );

-- Policy: Only admins can update flags
CREATE POLICY "Only admins can update flags"
    ON public.user_flags
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================
-- 4. Helper function: Check if user is suspended
-- ============================================
CREATE OR REPLACE FUNCTION is_user_suspended(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_status TEXT;
BEGIN
    SELECT status INTO user_status
    FROM public.profiles
    WHERE id = user_id;
    
    RETURN user_status = 'suspended';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION is_user_suspended IS 'Check if a user account is currently suspended';

-- ============================================
-- 5. Helper function: Get flag count for user
-- ============================================
CREATE OR REPLACE FUNCTION get_user_flag_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    flag_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO flag_count
    FROM public.user_flags
    WHERE reported_user_id = user_id
    AND status = 'pending';
    
    RETURN COALESCE(flag_count, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION get_user_flag_count IS 'Get count of pending flags for a user';

-- ============================================
-- 6. Update RLS policies to block suspended users
-- ============================================

-- Note: Suspended users will be blocked at the auth level via middleware
-- These policies provide additional database-level protection

-- Update matches policies to exclude suspended/deleted users
DO $$
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Users can view their own matches" ON public.matches;
    
    -- Recreate with suspension check
    CREATE POLICY "Users can view their own matches"
        ON public.matches
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.faces
                WHERE (faces.id = matches.face_a_id OR faces.id = matches.face_b_id)
                AND faces.user_id = auth.uid()
            )
            AND NOT EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.status IN ('suspended', 'deleted')
            )
        );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not update matches policy: %', SQLERRM;
END $$;

-- ============================================
-- 7. Verification
-- ============================================
DO $$
BEGIN
    -- Verify status column added
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'status'
    ) THEN
        RAISE NOTICE '✓ profiles.status column added';
    ELSE
        RAISE WARNING '✗ profiles.status column not found';
    END IF;
    
    -- Verify user_flags table created
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'user_flags'
    ) THEN
        RAISE NOTICE '✓ user_flags table created';
    ELSE
        RAISE WARNING '✗ user_flags table not found';
    END IF;
    
    -- Verify RLS enabled
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_flags' AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✓ RLS enabled on user_flags';
    ELSE
        RAISE WARNING '✗ RLS not enabled on user_flags';
    END IF;
END $$;
