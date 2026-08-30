## Why

The backend requires a dedicated, server-side API portal and background worker architecture to handle image generation requests from anonymous clients (such as a separate Flutter mobile/web application). Utilizing Supabase (Data API, Storage, and Edge Functions) provides a scalable, secure, and self-hosted foundation without managing custom monolithic servers.

## What Changes

- **Database Schema & RLS**: Add a `jobs` table to track job states (`pending`, `processing`, `completed`, `failed`), execution timestamps (`created_at`, `started_at`, `finished_at`), and file storage references, secured with Row Level Security (RLS) for anonymous user sessions.
- **Storage Buckets**: Configure Supabase Storage buckets and security policies for input source files and generated output images.
- **Edge Function Worker**: Implement a Supabase Edge Function that processes queued jobs via an abstract image generation provider interface (starting with a stub/mock provider).
- **CI/CD Pipeline**: Add automated GitHub Actions workflows for applying database migrations (`supabase db push`) and deploying Supabase Edge Functions (`supabase functions deploy`) to the self-hosted Supabase instance.

## Capabilities

### New Capabilities
- `image-generation/job`: Manages asynchronous image generation job lifecycle, status tracking, timestamps, storage attachments, and abstract provider integration.

### Modified Capabilities
- (None)

## Impact

- **Database**: New `jobs` table and RLS policies.
- **Storage**: New storage buckets and access rules.
- **Compute**: New Supabase Edge Function.
- **Infrastructure**: CI/CD deployment workflows.
