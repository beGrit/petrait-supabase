import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ImageGenerationProvider, StubProvider } from "./providers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobPayload {
  jobId: string;
}

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

async function fetchImageBytes(url: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download generated image: ${response.status} ${response.statusText}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/png";
  return { bytes, mimeType };
}

async function processJob(jobId: string, provider: ImageGenerationProvider): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch the job
  const { data: job, error: fetchError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (fetchError || !job) {
    throw new Error(`Job not found: ${fetchError?.message}`);
  }

  // Update status to processing
  const { error: updateError } = await supabase
    .from("jobs")
    .update({
      status: "processing",
      started_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (updateError) {
    throw new Error(`Failed to update job status: ${updateError.message}`);
  }

  try {
    // Call the image generation provider
    const result = await provider.generateImage(job.prompt, job.input_storage_path);

    // Download generated image from the returned URL (http(s) or data:)
    const { bytes, mimeType } = await fetchImageBytes(result.url);
    const ext = MIME_EXTENSIONS[mimeType] || MIME_EXTENSIONS[result.mimeType] || "png";

    // Upload result to output bucket
    const outputPath = `${job.user_id}/${jobId}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("image-gen-output")
      .upload(outputPath, bytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload result: ${uploadError.message}`);
    }

    // Update job to completed
    const { error: completeError } = await supabase
      .from("jobs")
      .update({
        status: "completed",
        output_storage_path: outputPath,
        finished_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (completeError) {
      throw new Error(`Failed to complete job: ${completeError.message}`);
    }
  } catch (error) {
    // Update job to failed
    const { error: failError } = await supabase
      .from("jobs")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
        finished_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (failError) {
      console.error("Failed to update job to failed:", failError.message);
    }
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json() as JobPayload;

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "jobId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use stub provider for now
    const provider = new StubProvider();
    await processJob(jobId, provider);

    return new Response(
      JSON.stringify({ success: true, jobId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing job:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});