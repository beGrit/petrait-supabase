export interface GenerationResult {
  url: string;
  mimeType: string;
}

export interface ImageGenerationProvider {
  generateImage(prompt: string, inputPath: string): Promise<GenerationResult>;
}

const STUB_IMAGE_URL = "https://res.cloudinary.com/demo/image/upload/dog.png";

export class StubProvider implements ImageGenerationProvider {
  async generateImage(_prompt: string, _inputPath: string): Promise<GenerationResult> {
    // Simulate some processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      url: STUB_IMAGE_URL,
      mimeType: "image/png",
    };
  }
}
