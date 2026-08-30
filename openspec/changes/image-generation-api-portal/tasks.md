## 1. Database Schema & Migration

- [x] 1.1 Create migration file for `jobs` table with columns: id (uuid), user_id (uuid), status (enum), prompt (text), input_storage_path (text), output_storage_path (text), error_message (text), created_at (timestamptz), started_at (timestamptz), finished_at (timestamptz) — verify `supabase db diff` shows expected changes.
- [x] 1.2 Add Row Level Security policies on `jobs` table to allow anonymous users to insert/select their own records — verify RLS works via Data API with anon key.
- [x] 1.3 Add indexes on `user_id` and `status` for query performance — verify index usage with `EXPLAIN ANALYZE`.

## 2. Supabase Storage Configuration

- [x] 2.1 Create storage buckets: `image-gen-input` (source files) and `image-gen-output` (generated images) — verify buckets exist in Supabase dashboard.
- [x] 2.2 Configure storage RLS policies to restrict access by user ID path — verify anonymous client can upload to own path and cannot access others.

## 3. Edge Function Worker

- [x] 3.1 Scaffold Supabase Edge Function `process-image-job` with TypeScript entry point — verify `supabase functions serve` runs locally.
- [x] 3.2 Define abstract `ImageGenerationProvider` interface and stub implementation returning mock result — verify stub returns expected shape.
- [x] 3.3 Implement job processing logic: fetch job by ID, update status to `processing` with `started_at`, call provider, upload result to output bucket, update status to `completed` with `finished_at` and output path — verify end-to-end flow with test job ID.
- [x] 3.4 Add error handling: on provider failure, update status to `failed` with error message and `finished_at` — verify failure path with simulated provider error.

## 4. CI/CD Pipeline

- [x] 4.1 Create GitHub Actions workflow for database migration deployment (`supabase db push`) — verify workflow runs on push to main and applies migrations to self-hosted Supabase.
- [x] 4.2 Create GitHub Actions workflow for Edge Function deployment (`supabase functions deploy`) — verify function is deployed and accessible via endpoint.
- [x] 4.3 Configure repository secrets for self-hosted Supabase credentials (access token, project ref) — verify secrets are masked and workflows authenticate successfully.

## 5. Integration Verification

- [x] 5.1 Create test script to simulate full client flow: anonymous auth → upload input → insert job → invoke Edge Function → poll for completion → verify output URL — verify script passes end-to-end.
- [x] 5.2 Document API contract for external clients (Flutter app): REST endpoints, request/response shapes, RLS usage — verify documentation is clear and matches implementation.