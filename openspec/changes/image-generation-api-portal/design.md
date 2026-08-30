## Context

See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Enable anonymous clients to directly create jobs and upload source assets via Supabase Data API and Storage.
- Implement a serverless Supabase Edge Function worker to process image generation jobs.
- Define an abstract image generation provider interface with mock/stub support.
- Establish CI/CD automation for database migrations and Edge Function deployments on self-hosted Supabase.

**Non-Goals:**
- Direct client-to-provider API communication.
- Complex user account management (relying purely on Supabase anonymous auth).
- Real-time WebSocket subscriptions (relying on REST status polling for simplicity).

## Decisions

### 1. Client-Driven Data API Job Insertion & Storage Upload
- **Choice**: Flutter app uploads source files directly to Supabase Storage and inserts the job record into the `jobs` table via PostgREST.
- **Rationale**: Minimizes serverless function overhead for file uploads and leverages Supabase's built-in RLS for security.
- **Alternatives Considered**: Proxying file uploads through an Edge Function (rejected due to payload size limits and memory overhead).

### 2. Supabase Edge Functions for Worker Execution
- **Choice**: Use Supabase Edge Functions (Deno) triggered by client invocation or database events to process jobs.
- **Rationale**: Native integration with Supabase, zero-infrastructure deployment, and seamless TypeScript support.
- **Alternatives Considered**: Dedicated Docker container worker (rejected to keep architecture lightweight and purely serverless for this phase).

### 3. Abstract Provider Interface
- **Choice**: Define a TypeScript interface for image generation (`ImageGenerationProvider`) with a stub implementation.
- **Rationale**: Decouples the job processor from specific AI vendors, making future integration straightforward.

### 4. GitHub Actions CI/CD
- **Choice**: Automate `supabase db push` and `supabase functions deploy` via GitHub Actions.
- **Rationale**: Ensures reproducible deployments and reliable sync with the self-hosted Supabase instance.

## Risks / Trade-offs

- **Anonymous Abuse / Resource Exhaustion** → *Mitigation*: RLS policies restrict users to their own job/storage paths; rate limiting can be added at the Edge Function gateway level.
- **Edge Function Execution Timeouts** → *Mitigation*: Ensure stub / mock providers respond instantly, and structure future provider calls with async polling or background triggers.

## Migration Plan

1. **Database**: Push migration defining `jobs` table, enums, timestamps, and RLS policies.
2. **Storage**: Provision input and output buckets with appropriate security rules.
3. **Compute**: Deploy the Edge Function worker containing the abstract provider stub.
4. **CI/CD**: Configure GitHub repository secrets for self-hosted Supabase access and enable the deployment pipeline.
