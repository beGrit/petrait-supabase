export interface GenerationResult {
  imageData: Uint8Array;
  mimeType: string;
}

export interface ImageGenerationProvider {
  generateImage(prompt: string, inputPath: string): Promise<GenerationResult>;
}

export class StubProvider implements ImageGenerationProvider {
  async generateImage(prompt: string, inputPath: string): Promise<GenerationResult> {
    // Simulate some processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Create a simple 100x100 PNG as mock output
    const canvasWidth = 100;
    const canvasHeight = 100;
    const imageData = new Uint8Array(canvasWidth * canvasHeight * 4);

    // Fill with a gradient based on prompt hash for visual variety
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = ((hash << 5) - hash) + prompt.charCodeAt(i);
      hash |= 0;
    }

    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const idx = (y * canvasWidth + x) * 4;
        imageData[idx] = (hash + x * 2) % 256;     // R
        imageData[idx + 1] = (hash + y * 2) % 256; // G
        imageData[idx + 2] = (hash + x + y) % 256; // B
        imageData[idx + 3] = 255;                   // A
      }
    }

    // Convert raw RGBA to PNG using a simple approach
    // For the stub, we'll return the raw bytes and let the caller handle encoding
    // In production, you'd use a proper PNG encoder
    return {
      imageData,
      mimeType: "image/png",
    };
  }
}