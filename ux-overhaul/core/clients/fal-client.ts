/**
 * fal.ai API Client for UX Overhaul Skill
 * Wraps nano-banana-pro endpoints with retry logic and error handling
 */

export interface FalImageRequest {
  prompt: string;
  numImages?: number;
  aspectRatio?: string;
  resolution?: '1K' | '2K' | '4K';
  outputFormat?: 'png' | 'jpeg' | 'webp';
}

export interface FalEditRequest extends FalImageRequest {
  imageUrl: string; // Base image to edit
  referenceImages?: string[]; // Up to 14 reference images
  strength?: number; // 0.0-1.0, how much to preserve original
}

export interface FalImage {
  url: string;
  fileName: string;
  contentType: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface FalResponse {
  images: FalImage[];
  description: string;
}

export interface FalResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts?: number;
  cost?: number;
}

export interface FalClientConfig {
  apiKey: string;
  maxRetries?: number;
  retryDelayMs?: number;
  baseUrl?: string;
}

const DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelayMs: 1000,
  baseUrl: 'https://fal.run/fal-ai'
};

// Cost per image in USD
const COST_PER_IMAGE = 0.15;
const COST_4K_MULTIPLIER = 2;

/**
 * Creates a fal.ai client instance
 */
export function createFalClient(config: FalClientConfig) {
  const { apiKey, maxRetries, retryDelayMs, baseUrl } = {
    ...DEFAULT_CONFIG,
    ...config
  };

  if (!apiKey) {
    throw new Error('FAL_KEY is required. Set it as an environment variable.');
  }

  /**
   * Sleeps for specified milliseconds
   */
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Makes a request to fal.ai with retry logic
   */
  async function makeRequest<T>(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<FalResult<T>> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${baseUrl}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const errorText = await response.text();
          lastError = `HTTP ${response.status}: ${errorText}`;

          // Don't retry on 4xx errors (client errors)
          if (response.status >= 400 && response.status < 500) {
            return { success: false, error: lastError, attempts: attempt };
          }

          // Retry on 5xx errors (server errors)
          if (attempt < maxRetries) {
            await sleep(retryDelayMs * attempt); // Exponential backoff
            continue;
          }
        }

        const data = await response.json() as T;
        return { success: true, data, attempts: attempt };
      } catch (error) {
        lastError = `Request failed: ${error}`;
        if (attempt < maxRetries) {
          await sleep(retryDelayMs * attempt);
        }
      }
    }

    return { success: false, error: lastError, attempts: maxRetries };
  }

  /**
   * Generates images from text prompt
   */
  async function generateImage(request: FalImageRequest): Promise<FalResult<FalResponse>> {
    const body = {
      prompt: request.prompt,
      num_images: request.numImages || 1,
      aspect_ratio: request.aspectRatio || '1:1',
      resolution: request.resolution || '1K',
      output_format: request.outputFormat || 'png'
    };

    const result = await makeRequest<FalResponse>('nano-banana-pro', body);

    if (result.success && result.data) {
      const numImages = result.data.images.length;
      const multiplier = request.resolution === '4K' ? COST_4K_MULTIPLIER : 1;
      result.cost = numImages * COST_PER_IMAGE * multiplier;
    }

    return result;
  }

  /**
   * Edits/transforms images using reference images
   */
  async function editImage(request: FalEditRequest): Promise<FalResult<FalResponse>> {
    if (!request.imageUrl) {
      return { success: false, error: 'imageUrl is required for edit' };
    }

    if (request.referenceImages && request.referenceImages.length > 14) {
      return { success: false, error: 'Maximum 14 reference images allowed' };
    }

    const body: Record<string, unknown> = {
      prompt: request.prompt,
      image_url: request.imageUrl,
      num_images: request.numImages || 1,
      aspect_ratio: request.aspectRatio || 'auto',
      resolution: request.resolution || '1K',
      output_format: request.outputFormat || 'png'
    };

    // Add strength if provided (for controlling edit intensity)
    if (request.strength !== undefined) {
      body.strength = request.strength;
    }

    // Add reference images if provided
    if (request.referenceImages && request.referenceImages.length > 0) {
      body.reference_images = request.referenceImages;
    }

    const result = await makeRequest<FalResponse>('nano-banana-pro/edit', body);

    if (result.success && result.data) {
      const numImages = result.data.images.length;
      const multiplier = request.resolution === '4K' ? COST_4K_MULTIPLIER : 1;
      result.cost = numImages * COST_PER_IMAGE * multiplier;
    }

    return result;
  }

  /**
   * Downloads an image from fal.ai URL to buffer
   */
  async function downloadImage(url: string): Promise<FalResult<Buffer>> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return { success: false, error: `Failed to download: HTTP ${response.status}` };
      }
      const arrayBuffer = await response.arrayBuffer();
      return { success: true, data: Buffer.from(arrayBuffer) };
    } catch (error) {
      return { success: false, error: `Download failed: ${error}` };
    }
  }

  /**
   * Checks API health
   */
  async function checkHealth(): Promise<FalResult<boolean>> {
    try {
      const response = await fetch(`${baseUrl}/nano-banana-pro`, {
        method: 'OPTIONS',
        headers: { 'Authorization': `Key ${apiKey}` }
      });
      return { success: response.ok, data: response.ok };
    } catch (error) {
      return { success: false, error: `Health check failed: ${error}` };
    }
  }

  /**
   * Calculates estimated cost for a batch of generations
   */
  function estimateCost(numImages: number, resolution: '1K' | '2K' | '4K' = '1K'): number {
    const multiplier = resolution === '4K' ? COST_4K_MULTIPLIER : 1;
    return numImages * COST_PER_IMAGE * multiplier;
  }

  return {
    generateImage,
    editImage,
    downloadImage,
    checkHealth,
    estimateCost
  };
}

export type FalClient = ReturnType<typeof createFalClient>;

/**
 * Creates a fal client from environment variable
 */
export function createFalClientFromEnv(): FalClient {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error('FAL_KEY environment variable is not set');
  }
  return createFalClient({ apiKey });
}
