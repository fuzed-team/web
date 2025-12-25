export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      babies: {
        Row: {
          celebrity_match_id: string | null
          created_at: string | null
          generated_by_profile_id: string | null
          id: string
          image_url: string
          match_id: string | null
        }
        Insert: {
          celebrity_match_id?: string | null
          created_at?: string | null
          generated_by_profile_id?: string | null
          id?: string
          image_url: string
          match_id?: string | null
        }
        Update: {
          celebrity_match_id?: string | null
          created_at?: string | null
          generated_by_profile_id?: string | null
          id?: string
          image_url?: string
          match_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "babies_celebrity_match_id_fkey"
            columns: ["celebrity_match_id"]
            isOneToOne: false
            referencedRelation: "celebrity_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "babies_generated_by_profile_id_fkey"
            columns: ["generated_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "babies_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      celebrities: {
        Row: {
          age: number | null
          analyzed_at: string | null
          bio: string | null
          blur_score: number | null
          category: string | null
          created_at: string | null
          embedding: string | null
          emotion_scores: Json | null
          expression: string | null
          expression_confidence: number | null
          featured_from: string | null
          featured_until: string | null
          gender: string | null
          geometry_ratios: Json | null
          id: string
          illumination_score: number | null
          image_hash: string | null
          image_path: string
          is_featured: boolean | null
          landmarks_68: Json | null
          name: string
          original_image_path: string | null
          pose: Json | null
          quality_score: number | null
          skin_tone_lab: number[] | null
          symmetry_score: number | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          analyzed_at?: string | null
          bio?: string | null
          blur_score?: number | null
          category?: string | null
          created_at?: string | null
          embedding?: string | null
          emotion_scores?: Json | null
          expression?: string | null
          expression_confidence?: number | null
          featured_from?: string | null
          featured_until?: string | null
          gender?: string | null
          geometry_ratios?: Json | null
          id?: string
          illumination_score?: number | null
          image_hash?: string | null
          image_path: string
          is_featured?: boolean | null
          landmarks_68?: Json | null
          name: string
          original_image_path?: string | null
          pose?: Json | null
          quality_score?: number | null
          skin_tone_lab?: number[] | null
          symmetry_score?: number | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          analyzed_at?: string | null
          bio?: string | null
          blur_score?: number | null
          category?: string | null
          created_at?: string | null
          embedding?: string | null
          emotion_scores?: Json | null
          expression?: string | null
          expression_confidence?: number | null
          featured_from?: string | null
          featured_until?: string | null
          gender?: string | null
          geometry_ratios?: Json | null
          id?: string
          illumination_score?: number | null
          image_hash?: string | null
          image_path?: string
          is_featured?: boolean | null
          landmarks_68?: Json | null
          name?: string
          original_image_path?: string | null
          pose?: Json | null
          quality_score?: number | null
          skin_tone_lab?: number[] | null
          symmetry_score?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      celebrity_matches: {
        Row: {
          celebrity_id: string
          created_at: string | null
          face_id: string
          id: string
          similarity_score: number
          updated_at: string | null
        }
        Insert: {
          celebrity_id: string
          created_at?: string | null
          face_id: string
          id?: string
          similarity_score: number
          updated_at?: string | null
        }
        Update: {
          celebrity_id?: string
          created_at?: string | null
          face_id?: string
          id?: string
          similarity_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "celebrity_matches_celebrity_id_fkey"
            columns: ["celebrity_id"]
            isOneToOne: false
            referencedRelation: "celebrities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celebrity_matches_face_id_fkey"
            columns: ["face_id"]
            isOneToOne: false
            referencedRelation: "faces"
            referencedColumns: ["id"]
          },
        ]
      }
      faces: {
        Row: {
          age: number | null
          analyzed_at: string | null
          blur_score: number | null
          created_at: string | null
          embedding: string | null
          emotion_scores: Json | null
          expression: string | null
          expression_confidence: number | null
          gender: string | null
          geometry_ratios: Json | null
          id: string
          illumination_score: number | null
          image_hash: string | null
          image_path: string
          landmarks_68: Json | null
          pose: Json | null
          profile_id: string
          quality_score: number | null
          skin_tone_lab: number[] | null
          symmetry_score: number | null
        }
        Insert: {
          age?: number | null
          analyzed_at?: string | null
          blur_score?: number | null
          created_at?: string | null
          embedding?: string | null
          emotion_scores?: Json | null
          expression?: string | null
          expression_confidence?: number | null
          gender?: string | null
          geometry_ratios?: Json | null
          id?: string
          illumination_score?: number | null
          image_hash?: string | null
          image_path: string
          landmarks_68?: Json | null
          pose?: Json | null
          profile_id: string
          quality_score?: number | null
          skin_tone_lab?: number[] | null
          symmetry_score?: number | null
        }
        Update: {
          age?: number | null
          analyzed_at?: string | null
          blur_score?: number | null
          created_at?: string | null
          embedding?: string | null
          emotion_scores?: Json | null
          expression?: string | null
          expression_confidence?: number | null
          gender?: string | null
          geometry_ratios?: Json | null
          id?: string
          illumination_score?: number | null
          image_hash?: string | null
          image_path?: string
          landmarks_68?: Json | null
          pose?: Json | null
          profile_id?: string
          quality_score?: number | null
          skin_tone_lab?: number[] | null
          symmetry_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faces_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          error_message: string | null
          face_id: string
          id: string
          job_type: string | null
          max_attempts: number
          next_run_at: string | null
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          face_id: string
          id?: string
          job_type?: string | null
          max_attempts?: number
          next_run_at?: string | null
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          face_id?: string
          id?: string
          job_type?: string | null
          max_attempts?: number
          next_run_at?: string | null
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_jobs_face_id_fkey"
            columns: ["face_id"]
            isOneToOne: false
            referencedRelation: "faces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          face_a_id: string
          face_b_id: string
          id: string
          similarity_score: number
        }
        Insert: {
          created_at?: string | null
          face_a_id: string
          face_b_id: string
          id?: string
          similarity_score: number
        }
        Update: {
          created_at?: string | null
          face_a_id?: string
          face_b_id?: string
          id?: string
          similarity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "matches_face_a_id_fkey"
            columns: ["face_a_id"]
            isOneToOne: false
            referencedRelation: "faces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_face_b_id_fkey"
            columns: ["face_b_id"]
            isOneToOne: false
            referencedRelation: "faces"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          connection_id: string
          content: string
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          connection_id: string
          content: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          connection_id?: string
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "mutual_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mutual_connections: {
        Row: {
          baby_id: string | null
          created_at: string
          id: string
          match_id: string
          profile_a_id: string
          profile_b_id: string
          status: string
          updated_at: string
        }
        Insert: {
          baby_id?: string | null
          created_at?: string
          id?: string
          match_id: string
          profile_a_id: string
          profile_b_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          baby_id?: string | null
          created_at?: string
          id?: string
          match_id?: string
          profile_a_id?: string
          profile_b_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mutual_connections_baby_id_fkey"
            columns: ["baby_id"]
            isOneToOne: false
            referencedRelation: "babies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutual_connections_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutual_connections_profile_a_id_fkey"
            columns: ["profile_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutual_connections_profile_b_id_fkey"
            columns: ["profile_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read_at: string | null
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          default_face_id: string | null
          email: string | null
          gender: string | null
          id: string
          last_seen: string | null
          name: string | null
          role: string
          school: string | null
          status: string
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_face_id?: string | null
          email?: string | null
          gender?: string | null
          id: string
          last_seen?: string | null
          name?: string | null
          role?: string
          school?: string | null
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_face_id?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_seen?: string | null
          name?: string | null
          role?: string
          school?: string | null
          status?: string
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_default_face"
            columns: ["default_face_id"]
            isOneToOne: false
            referencedRelation: "faces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_suspended_by_fkey"
            columns: ["suspended_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          match_id: string
          reaction_type: string
          user_profile_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          match_id: string
          reaction_type: string
          user_profile_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          match_id?: string
          reaction_type?: string
          user_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_quotas: {
        Row: {
          baby_generations_count: number
          created_at: string
          date: string
          id: string
          photo_uploads_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          baby_generations_count?: number
          created_at?: string
          date: string
          id?: string
          photo_uploads_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          baby_generations_count?: number
          created_at?: string
          date?: string
          id?: string
          photo_uploads_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flags: {
        Row: {
          created_at: string
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_flags_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_flags_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_flags_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_advanced_similarity: {
        Args: {
          query_age: number
          query_embedding: string
          query_expression: string
          query_geometry: Json
          query_skin_tone: number[]
          query_symmetry: number
          target_age: number
          target_embedding: string
          target_expression: string
          target_geometry: Json
          target_skin_tone: number[]
          target_symmetry: number
        }
        Returns: number
      }
      check_daily_limit: {
        Args: { p_limit_key: string; p_limit_type: string; p_user_id: string }
        Returns: {
          allowed: boolean
          current_count: number
          limit_value: number
          reset_at: string
        }[]
      }
      cleanup_old_daily_quotas: { Args: never; Returns: undefined }
      cleanup_old_match_jobs: { Args: never; Returns: number }
      euclidean_distance_lab: {
        Args: { arr1: number[]; arr2: number[] }
        Returns: number
      }
      find_celebrity_matches_advanced: {
        Args: {
          category_filter?: string
          match_count?: number
          match_threshold?: number
          query_face_id: string
          user_gender: string
        }
        Returns: {
          age: number
          bio: string
          category: string
          celebrity_id: string
          celebrity_name: string
          expression: string
          gender: string
          image_path: string
          similarity: number
        }[]
      }
      find_similar_faces_advanced: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_face_id: string
          user_gender: string
          user_school: string
        }
        Returns: {
          age: number
          expression: string
          face_id: string
          image_path: string
          name: string
          profile_id: string
          similarity: number
        }[]
      }
      get_match_commonalities: {
        Args: { face_id_1: string; face_id_2: string }
        Returns: Json
      }
      get_match_job_stats: {
        Args: never
        Returns: {
          count: number
          oldest_job: string
          status: string
        }[]
      }
      get_setting: {
        Args: { default_value?: Json; setting_key: string }
        Returns: Json
      }
      get_user_flag_count: { Args: { user_id: string }; Returns: number }
      increment_daily_usage: {
        Args: { p_limit_type: string; p_user_id: string }
        Returns: undefined
      }
      is_user_suspended: { Args: { user_id: string }; Returns: boolean }
      match_users_with_daily_celebrities: {
        Args: never
        Returns: {
          errors_count: number
          matches_created: number
          users_processed: number
        }[]
      }
      rotate_daily_celebrity: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
