import { AIGenerationRequest, AIGenerationResponse, GenerationHistoryItem, AIError, GenerationProgress, AI_MODEL_CONFIG, AI_MODEL, GenerationParameters } from './ai-generation.models';

export interface AIState {
  // current generation session
  currentRequest: AIGenerationRequest | null;
  currentResponse: AIGenerationResponse | null;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  
  // history and favorites
  generationHistory: GenerationHistoryItem[];
  favorites: GenerationHistoryItem[];

  // error handling
  error: AIError | null;
  
  // API Status
  apiStatus: {
    huggingFace: APIStatus;
    googleAI: APIStatus;
  };
  
  // model configuration
  modelConfig: {
    currentModel: AI_MODEL;
    availableModels: AI_MODEL_CONFIG[];
    parameters: { [key in AI_MODEL]: GenerationParameters };
  };
  
  // user preferences
  userPreferences: UserPreferences;
}

export interface APIStatus {
  isAvailable: boolean;
  rateLimit: {
    used: number;
    limit: number;
    resetTime: number;
  };
  lastChecked: number;
  latency: number;
}

export interface UserPreferences {
  autoSave: boolean;
  defaultModel: AI_MODEL;
  imageQuality: 'low' | 'medium' | 'high';
  theme: 'light' | 'dark';
  promptSuggestions: boolean;
  batchGeneration: boolean;
}
