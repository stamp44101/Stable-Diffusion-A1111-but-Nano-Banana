export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "3:4",
  LANDSCAPE = "4:3",
  TALL = "9:16",
  WIDE = "16:9"
}

export enum ImageSize {
  Resolution1K = "1K",
  Resolution2K = "2K",
  Resolution4K = "4K"
}

export interface GenerationSettings {
  prompt: string;
  negativePrompt: string;
  seed: number; // -1 for random
  batchSize: number;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  creativity: number; // Temperature
  filenamePrefix: string;
  compressionQuality: number; // 0.1 to 1.0
}

export interface GeneratedImage {
  id: string;
  url: string; // Data URL
  settings: GenerationSettings;
  timestamp: number;
}
