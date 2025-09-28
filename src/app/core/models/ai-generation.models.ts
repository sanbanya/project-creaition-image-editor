// ============================================================================
// AI models and generation interfaces
// ============================================================================

export type AI_MODEL = 'stable-diffusion' | 'qwen-image-edit' | 'google-imagen';
export type GenerationMode = 'text-to-image' | 'image-to-image' | 'inpainting' | 'upscale';
export type ImageFormat = 'png' | 'jpeg' | 'webp';
export type SamplerType = 'Euler' | 'DPMSolver' | 'DDIM' | 'Karras' | 'DPMSolverMultistepScheduler';

// ============================================================================
// request and response models
// ============================================================================

/**
 * AI generation request interface
 */
export interface AIGenerationRequest {
  // basic info
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: AI_MODEL;
  mode: GenerationMode;
  timestamp: number;

  // generation parameters
  parameters: GenerationParameters;

  // input data (for image-to-image and inpainting)
  inputImage?: string; // Base64 encoded image
  maskImage?: string;  // Base64 encoded mask for inpainting

  // metadata
  metadata?: {
    sessionId?: string;
    userId?: string;
    deviceInfo?: DeviceInfo;
    userAgent?: string;
  };
}

/**
 * generation parameters interface
 */
export interface GenerationParameters {
  mask_image?: string;
  // image dimensions
  width: number;
  height: number;

  // generation quality
  steps: number;
  guidanceScale: number; // CFG scale

  // randomness control
  seed?: number;

  // image-to-image strength (0.1 - 1.0)
  strength?: number;

  // sampler settings
  sampler?: SamplerType;
  samplerSteps?: number;

  // batch generation
  numOutputs?: number;
  batchSize?: number;

  // advanced parameters
  clipSkip?: number;
  eta?: number;
  vae?: string;

  // output format
  outputFormat?: ImageFormat;
  quality?: number; // 1-100
}

/**
 * AI generation response interface
 */
export interface AIGenerationResponse {
  // identification info
  id: string;
  requestId: string;
  timestamp: number;

  // generated image data
  images: string[]; // Base64 encoded images

  // generation metadata
  metadata: {
    generationTime: number;
    model: AI_MODEL;
    parameters: GenerationParameters;
    prompt: string;
    negativePrompt?: string;
    seed: number;
    stepsCompleted: number;
    totalSteps: number;

    // performance metrics
    performance?: {
      tokensPerSecond?: number;
      memoryUsage?: number;
      gpuUtilization?: number;
    };

    // quality assessment
    qualityMetrics?: {
      clarityScore?: number;
      coherenceScore?: number;
      aestheticScore?: number;
    };
  };

  // error information (if generation fails)
  error?: AIError;
}

// ============================================================================
// history models
// ============================================================================

/**
 * generation history item
 */
export interface GenerationHistoryItem {
  id: string;
  request: AIGenerationRequest;
  response: AIGenerationResponse;
  timestamp: number;

  // user interaction data
  favorite: boolean;
  rating?: number; // 1-5
  tags: string[];
  notes?: string;

  // usage statistics
  viewCount: number;
  lastViewed?: number;
  usedInProjects?: string[];

  // export information
  exports?: ExportInfo[];
}

/**
 * export information
 */
export interface ExportInfo {
  format: ImageFormat;
  quality: number;
  timestamp: number;
  fileName: string;
  fileSize: number;
}

// ============================================================================
// error handling models
// ============================================================================

/**
 * AI error interface
 */
export interface AIError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  requestId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';

  // retry information
  retryable?: boolean;
  retryAfter?: number; // milliseconds
  maxRetries?: number;

  // debugging information
  stackTrace?: string;
  context?: {
    model?: string;
    parameters?: any;
    inputSize?: number;
  };
}

// ============================================================================
// progress tracking models
// ============================================================================

/**
 * generation progress interface
 */
export interface GenerationProgress {
  requestId: string;
  progress: number; // 0-100
  step: number;
  totalSteps: number;
  status: 'pending' | 'preprocessing' | 'generating' | 'postprocessing' | 'completed' | 'failed' | 'cancelled';

  // time information
  startTime: number;
  estimatedTimeRemaining?: number;
  elapsedTime: number;

  // detailed progress
  currentStage?: string;
  stageProgress?: number;
  subSteps?: {
    current: number;
    total: number;
    description: string;
  };

  // preview information (if supported)
  previewImage?: string;
  intermediateResults?: string[];
}

// ============================================================================
// AI model configuration models
// ============================================================================

/**
 * AI model configuration interface
 */
export interface AI_MODEL_CONFIG {
  // basic info
  name: AI_MODEL;
  displayName: string;
  description: string;
  provider: 'huggingface' | 'google' | 'openai' | 'stabilityai';
  version: string;

  // capabilities
  supportedModes: GenerationMode[];
  features: string[];
  limitations: string[];

  // technical specifications
  maxSize: number;
  minSize: number;
  aspectRatios: string[]; // ['1:1', '16:9', '4:3', ...]
  supportedSamplers: SamplerType[];

  // DEFAULT AND RECOMMENDED PARAMETERS
  defaultParameters: GenerationParameters;
  recommendedParameters: {
    [key in GenerationMode]?: Partial<GenerationParameters>;
  };

  // PREMIUM AND RATE LIMITS
  costPerImage?: number;
  freeTierLimit?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };

  // API info
  apiEndpoint?: string;
  documentationUrl?: string;
  requiresAuth: boolean;
}

// ============================================================================
// API status models
// ============================================================================

/**
 * API status interface
 */
export interface APIStatus {
  isAvailable: boolean;
  lastChecked: number;
  latency: number; // milliseconds
  uptime: number; // percentage

  // rate limit information
  rateLimit: {
    used: number;
    limit: number;
    resetTime: number;
    window: 'minute' | 'hour' | 'day' | 'month';
  };

  // error statistics
  errorStats: {
    totalErrors: number;
    lastError?: AIError;
    errorRate: number; // percentage
  };

  // performance metrics
  performance: {
    averageResponseTime: number;
    successRate: number;
    throughput: number; // requests per minute
  };
}

// ============================================================================
// user preferences models
// ============================================================================

/**
 * user preferences interface
 */
export interface UserPreferences {
  // generation defaults
  defaultModel: AI_MODEL;
  defaultMode: GenerationMode;
  imageQuality: 'low' | 'medium' | 'high' | 'ultra';
  autoSave: boolean;
  autoDownload: boolean;

  // UI settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  showAdvancedSettings: boolean;
  compactMode: boolean;

  // prompt settings
  promptSuggestions: boolean;
  autoComplete: boolean;
  negativePromptLibrary: string[];

  // privacy settings
  saveGenerationHistory: boolean;
  shareAnonymousData: boolean;
  clearDataOnExit: boolean;

  // performance settings
  cacheImages: boolean;
  maxCacheSize: number; // MB
  parallelProcessing: boolean;

  // export settings
  defaultFormat: ImageFormat;
  defaultQuality: number;
  watermark: {
    enabled: boolean;
    text?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

// ============================================================================
// state and utility models
// ============================================================================

/**
 * AI generation state interface
 */
export interface AIState {
  // current generation session
  currentRequest: AIGenerationRequest | null;
  currentResponse: AIGenerationResponse | null;
  isGenerating: boolean;
  progress: GenerationProgress | null;

  // history and favorites
  generationHistory: GenerationHistoryItem[];
  favorites: GenerationHistoryItem[];
  selectedHistoryItem: GenerationHistoryItem | null;

  // error handling
  error: AIError | null;
  errorHistory: AIError[];

  // API status 
  apiStatus: {
    huggingFace: APIStatus;
    googleAI: APIStatus;
    stabilityAI: APIStatus;
  };

  // model configuration
  modelConfig: {
    currentModel: AI_MODEL;
    availableModels: AI_MODEL_CONFIG[];
    parameters: { [key in AI_MODEL]: GenerationParameters };
    modelStatistics: ModelStatistics;
  };

  // user preferences
  userPreferences: UserPreferences;

  // session information
  session: {
    id: string;
    startTime: number;
    totalGenerations: number;
    totalTimeSpent: number;
  };

  // cache 
  cache: {
    promptCache: Map<string, any>;
    imageCache: Map<string, string>;
    modelCache: Map<string, any>;
  };
}

/**
 * model usage statistics
 */
export interface ModelStatistics {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageGenerationTime: number;
  mostUsedPrompts: Array<{ prompt: string; count: number }>;
  modelUsage: { [key in AI_MODEL]: number };
  modeUsage: { [key in GenerationMode]: number };
}

// ============================================================================
// device information models
// ============================================================================

/**
 * device information
 */
export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: string;
  browser: string;
  screenResolution: string;
  connectionType?: 'wifi' | '4g' | '5g' | '3g' | '2g';
}

// ============================================================================
// initial state and defaults
// ============================================================================

/**
 * default generation parameters for each model
 */
export const DEFAULT_PARAMETERS: { [key in AI_MODEL]: GenerationParameters } = {
  'stable-diffusion': {
    width: 512,
    height: 512,
    steps: 20,
    guidanceScale: 7.5,
    sampler: 'DPMSolver',
    numOutputs: 1,
    outputFormat: 'png',
    quality: 95
  },
  'qwen-image-edit': {
    width: 512,
    height: 512,
    steps: 25,
    guidanceScale: 7.0,
    sampler: 'Euler',
    numOutputs: 1,
    outputFormat: 'png',
    quality: 90
  },
  'google-imagen': {
    width: 512,
    height: 512,
    steps: 30,
    guidanceScale: 8.0,
    sampler: 'Karras',
    numOutputs: 1,
    outputFormat: 'jpeg',
    quality: 85
  }
};

/**
 * supported AI models configuration
 */
export const MODEL_CONFIGS: AI_MODEL_CONFIG[] = [
  {
    name: 'stable-diffusion',
    displayName: 'Stable Diffusion XL',
    description: ' the state-of-the-art open-source text-to-image model offering high-quality image generation and rich control options',
    provider: 'huggingface',
    version: '1.0',
    supportedModes: ['text-to-image', 'image-to-image', 'inpainting'],
    features: ['high_quality', 'fast_generation', 'detailed_control', 'open_source'],
    limitations: ['requires_prompt_tuning', 'may_generate_artifacts'],
    maxSize: 1024,
    minSize: 256,
    aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
    supportedSamplers: ['Euler', 'DPMSolver', 'DDIM'],
    defaultParameters: DEFAULT_PARAMETERS['stable-diffusion'],
    recommendedParameters: {
      'text-to-image': { steps: 25, guidanceScale: 7.5 },
      'image-to-image': { steps: 20, strength: 0.75 },
      'inpainting': { steps: 30, guidanceScale: 7.0 }
    },
    costPerImage: 0.002,
    freeTierLimit: 1000,
    rateLimit: { requestsPerMinute: 10, requestsPerDay: 1000 },
    requiresAuth: true
  },
  {
    name: 'qwen-image-edit',
    displayName: 'Qwen Image Edit',
    description: 'strong multimodal model excelling in image understanding and editing tasks',
    provider: 'huggingface',
    version: '2.5',
    supportedModes: ['text-to-image', 'image-to-image'],
    features: ['image_understanding', 'text_grounding', 'context_aware'],
    limitations: ['limited_creative_mode', 'requires_clear_instructions'],
    maxSize: 1024,
    minSize: 128,
    aspectRatios: ['1:1', '16:9', '4:3'],
    supportedSamplers: ['Euler', 'DPMSolver'],
    defaultParameters: DEFAULT_PARAMETERS['qwen-image-edit'],
    recommendedParameters: {
      'text-to-image': { steps: 30, guidanceScale: 7.0 },
      'image-to-image': { steps: 25, strength: 0.8 }
    },
    costPerImage: 0.003,
    freeTierLimit: 500,
    rateLimit: { requestsPerMinute: 5, requestsPerDay: 500 },
    requiresAuth: true
  },
  {
    name: 'google-imagen',
    displayName: 'Google Imagen',
    description: 'Google Images from text prompts, excelling in photorealism and complex scene generation',
    provider: 'google',
    version: '2.0',
    supportedModes: ['text-to-image'],
    features: ['photorealistic', 'high_resolution', 'consistent_quality'],
    limitations: ['limited_control', 'no_image_editing', 'commercial_restrictions'],
    maxSize: 2048,
    minSize: 512,
    aspectRatios: ['1:1', '16:9', '4:3', '2:3', '3:2'],
    supportedSamplers: ['Karras'],
    defaultParameters: DEFAULT_PARAMETERS['google-imagen'],
    recommendedParameters: {
      'text-to-image': { steps: 40, guidanceScale: 8.0 }
    },
    costPerImage: 0.005,
    freeTierLimit: 100,
    rateLimit: { requestsPerMinute: 2, requestsPerDay: 100 },
    requiresAuth: true
  }
];

/**
 * default user preferences
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultModel: 'stable-diffusion',
  defaultMode: 'text-to-image',
  imageQuality: 'high',
  autoSave: true,
  autoDownload: false,
  theme: 'auto',
  language: 'zh-CN',
  showAdvancedSettings: false,
  compactMode: false,
  promptSuggestions: true,
  autoComplete: true,
  negativePromptLibrary: [],
  saveGenerationHistory: true,
  shareAnonymousData: false,
  clearDataOnExit: false,
  cacheImages: true,
  maxCacheSize: 500,
  parallelProcessing: false,
  defaultFormat: 'png',
  defaultQuality: 95,
  watermark: {
    enabled: false,
    text: 'Generated with Creaition AI',
    position: 'bottom-right'
  }
};

/**
 * 初始应用状态
 */
export const initialAIState: AIState = {
  currentRequest: null,
  currentResponse: null,
  isGenerating: false,
  progress: null,
  generationHistory: [],
  favorites: [],
  selectedHistoryItem: null,
  error: null,
  errorHistory: [],
  apiStatus: {
    huggingFace: {
      isAvailable: false,
      lastChecked: 0,
      latency: 0,
      uptime: 0,
      rateLimit: {
        used: 0,
        limit: 1000,
        resetTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        window: 'month'
      },
      errorStats: {
        totalErrors: 0,
        errorRate: 0
      },
      performance: {
        averageResponseTime: 0,
        successRate: 0,
        throughput: 0
      }
    },
    googleAI: {
      isAvailable: false,
      lastChecked: 0,
      latency: 0,
      uptime: 0,
      rateLimit: {
        used: 0,
        limit: 100,
        resetTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
        window: 'month'
      },
      errorStats: {
        totalErrors: 0,
        errorRate: 0
      },
      performance: {
        averageResponseTime: 0,
        successRate: 0,
        throughput: 0
      }
    },
    stabilityAI: {
      isAvailable: false,
      lastChecked: 0,
      latency: 0,
      uptime: 0,
      rateLimit: {
        used: 0,
        limit: 0,
        resetTime: 0,
        window: 'month'
      },
      errorStats: {
        totalErrors: 0,
        errorRate: 0
      },
      performance: {
        averageResponseTime: 0,
        successRate: 0,
        throughput: 0
      }
    }
  },
  modelConfig: {
    currentModel: 'stable-diffusion',
    availableModels: MODEL_CONFIGS,
    parameters: DEFAULT_PARAMETERS,
    modelStatistics: {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageGenerationTime: 0,
      mostUsedPrompts: [],
      modelUsage: {
        'stable-diffusion': 0,
        'qwen-image-edit': 0,
        'google-imagen': 0
      },
      modeUsage: {
        'text-to-image': 0,
        'image-to-image': 0,
        'inpainting': 0,
        'upscale': 0
      }
    }
  },
  userPreferences: DEFAULT_USER_PREFERENCES,
  session: {
    id: generateSessionId(),
    startTime: Date.now(),
    totalGenerations: 0,
    totalTimeSpent: 0
  },
  cache: {
    promptCache: new Map(),
    imageCache: new Map(),
    modelCache: new Map()
  }
};

// ============================================================================
// utility functions
// ============================================================================

/**
 * session ID generator
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * create a default generation request
 */
export function createDefaultRequest(
  prompt: string, 
  model: AI_MODEL = 'stable-diffusion',
  mode: GenerationMode = 'text-to-image'
): AIGenerationRequest {
  return {
    id: generateRequestId(),
    prompt,
    model,
    mode,
    timestamp: Date.now(),
    parameters: { ...DEFAULT_PARAMETERS[model] }
  };
}

/**
 * request ID generator
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * validate generation parameters
 */
export function validateParameters(parameters: GenerationParameters): string[] {
  const errors: string[] = [];

  if (parameters.width < 64 || parameters.width > 4096) {
    errors.push('Width must be between 64 and 4096');
  }

  if (parameters.height < 64 || parameters.height > 4096) {
    errors.push('Height must be between 64 and 4096');
  }

  if (parameters.steps < 1 || parameters.steps > 100) {
    errors.push('Steps must be between 1 and 100');
  }

  if (parameters.guidanceScale < 1 || parameters.guidanceScale > 20) {
    errors.push('Guidance scale must be between 1 and 20');
  }

  if (parameters.strength && (parameters.strength < 0.1 || parameters.strength > 1)) {
    errors.push('Strength must be between 0.1 and 1.0');
  }

  return errors;
}

/**
 * calculate estimated generation time (in milliseconds)
 */
export function estimateGenerationTime(parameters: GenerationParameters): number {
  // simple heuristic: base time + time per step
  const baseTime = 2000; // 2 seconds base time
  const timePerStep = 150; // every step adds 150ms
  return baseTime + parameters.steps * timePerStep;
}

// ============================================================================
// type guards and validation functions
// ============================================================================

/**
 * type guard: checks if a value is a valid AI_MODEL
 */
export function isValidAIModel(model: string): model is AI_MODEL {
  return ['stable-diffusion', 'qwen-image-edit', 'google-imagen'].includes(model);
}

/**
 * type guard: checks if a value is a valid GenerationMode
 */
export function isValidGenerationMode(mode: string): mode is GenerationMode {
  return ['text-to-image', 'image-to-image', 'inpainting', 'upscale'].includes(mode);
}

/**
 * validate a full generation request
 */
export function validateGenerationRequest(request: Partial<AIGenerationRequest>): string[] {
  const errors: string[] = [];

  if (!request.prompt || request.prompt.trim().length < 2) {
    errors.push('prompt is required and must be at least 2 characters long');
  }

  if (request.prompt && request.prompt.length > 1000) {
    errors.push('prompt exceeds maximum length of 1000 characters');
  }

  if (!request.model || !isValidAIModel(request.model)) {
    errors.push('Invalid AI model');
  }

  if (!request.mode || !isValidGenerationMode(request.mode)) {
    errors.push('Invalid generation mode');
  }

  if (request.parameters) {
    errors.push(...validateParameters(request.parameters));
  }

  return errors;
}

export default {
  DEFAULT_PARAMETERS,
  MODEL_CONFIGS,
  DEFAULT_USER_PREFERENCES,
  initialAIState,
  createDefaultRequest,
  validateParameters,
  estimateGenerationTime,
  isValidAIModel,
  isValidGenerationMode,
  validateGenerationRequest
};