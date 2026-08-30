-- Create job status enum
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status job_status NOT NULL DEFAULT 'pending',
    prompt TEXT NOT NULL,
    input_storage_path TEXT NOT NULL,
    output_storage_path TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ
);

-- Create indexes for query performance
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anonymous users
-- Allow anonymous users to insert their own jobs
CREATE POLICY "Allow anonymous insert own jobs" ON jobs
    FOR INSERT
    TO anon
    WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to select their own jobs
CREATE POLICY "Allow anonymous select own jobs" ON jobs
    FOR SELECT
    TO anon
    USING (auth.uid() = user_id);

-- Allow anonymous users to update their own jobs (for status updates by edge function)
CREATE POLICY "Allow anonymous update own jobs" ON jobs
    FOR UPDATE
    TO anon
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions to service_role for Edge Function access
GRANT INSERT, SELECT, UPDATE, DELETE ON jobs TO service_role;