# AI Matching

This is a Next.js application for the AI Matching platform.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query/latest)
- **Backend**: [Supabase](https://supabase.com/)
- **Testing**: [Vitest](https://vitest.dev/)

# Getting Started

To run this application in development mode:

```bash
bun install
bun run dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

# Building For Production

To build this application for production:

```bash
bun run build
```

To run the production build:

```bash
bun run start
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
bun run test
```

## API Integration

This project uses [Supabase](https://supabase.com/) for backend services and authentication.

### Environment Variables

Create a `.env` file with:

```
NEXT_PUBLIC_BASE_API_URL=/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_SIGNED_URL_TTL=86400

# Replicate AI (Face Analysis)
REPLICATE_API_TOKEN=your_replicate_token
REPLICATE_MODEL_VERSION=your_model_version

# FAL.AI (Baby Generator)
FAL_AI_API_KEY=your_fal_api_key
FAL_BABY_MODEL_ID=fal-ai/nano-banana/edit
```

See `.env.example` for complete list of required environment variables.

# Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand.docs.pmnd.rs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
