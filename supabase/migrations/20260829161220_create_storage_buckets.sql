-- Create storage buckets for image generation
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('image-gen-input', 'image-gen-input', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('image-gen-output', 'image-gen-output', false, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow anonymous users to upload to their own path in image-gen-input bucket
CREATE POLICY "Allow anon upload to own input path" ON storage.objects
    FOR INSERT
    TO anon
    WITH CHECK (
        bucket_id = 'image-gen-input' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow anonymous users to select their own files in image-gen-input bucket
CREATE POLICY "Allow anon select own input files" ON storage.objects
    FOR SELECT
    TO anon
    USING (
        bucket_id = 'image-gen-input' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow anonymous users to update their own files in image-gen-input bucket
CREATE POLICY "Allow anon update own input files" ON storage.objects
    FOR UPDATE
    TO anon
    USING (
        bucket_id = 'image-gen-input' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'image-gen-input' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow anonymous users to delete their own files in image-gen-input bucket
CREATE POLICY "Allow anon delete own input files" ON storage.objects
    FOR DELETE
    TO anon
    USING (
        bucket_id = 'image-gen-input' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow anonymous users to select their own files in image-gen-output bucket
CREATE POLICY "Allow anon select own output files" ON storage.objects
    FOR SELECT
    TO anon
    USING (
        bucket_id = 'image-gen-output' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy: Allow service role (Edge Function) to insert into image-gen-output bucket
CREATE POLICY "Allow service role insert output" ON storage.objects
    FOR INSERT
    TO service_role
    WITH CHECK (
        bucket_id = 'image-gen-output'
    );

-- Policy: Allow service role (Edge Function) to select from image-gen-output bucket
CREATE POLICY "Allow service role select output" ON storage.objects
    FOR SELECT
    TO service_role
    USING (
        bucket_id = 'image-gen-output'
    );