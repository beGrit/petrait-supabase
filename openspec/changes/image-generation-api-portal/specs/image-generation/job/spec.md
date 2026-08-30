## Purpose

Defines the asynchronous image generation job lifecycle, status tracking, timestamps, storage attachments, and abstract provider integration for anonymous clients interacting through Supabase Data API and Edge Functions.

## ADDED Requirements

### Requirement: Job Creation via Data API
The system SHALL allow anonymous clients to create a new image generation job record directly in the `jobs` table via the Supabase Data API.

#### Scenario: Successful job creation
- **WHEN** an anonymous user uploads source files to storage and inserts a record into the `jobs` table with a prompt and input storage reference
- **THEN** the system persists the job with status `pending`, records `created_at`, and makes the job record accessible to the user via RLS.

### Requirement: Job Lifecycle and Status Tracking
The system SHALL expose job status, state timestamps, and storage output paths via RESTful queries.

#### Scenario: Querying job status and timestamps
- **WHEN** an anonymous client queries their job by ID
- **THEN** the system returns the current status (`pending`, `processing`, `completed`, `failed`), `created_at`, `started_at`, `finished_at`, and result storage path when completed.

### Requirement: Asynchronous Worker Execution
The system SHALL process pending jobs asynchronously via a Supabase Edge Function using an abstract image generation provider interface.

#### Scenario: Job processing workflow
- **WHEN** the processing Edge Function is invoked for a job ID
- **THEN** the system updates job status to `processing`, sets `started_at`, executes the abstract provider, uploads results to storage, sets status to `completed` (or `failed` with error message), and sets `finished_at`.
