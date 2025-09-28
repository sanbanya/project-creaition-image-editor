import { createAction, props } from '@ngrx/store';
import { AIGenerationRequest, AIGenerationResponse, GenerationHistoryItem, AIError, GenerationProgress, AI_MODEL } from '../../core/models/ai-generation.models';

// generation actions
export const generateImage = createAction(
  '[AI Generation] Generate Image',
  props<{ request: AIGenerationRequest }>()
);

export const generateImageSuccess = createAction(
  '[AI Generation] Generate Image Success',
  props<{ response: AIGenerationResponse }>()
);

export const generateImageFailure = createAction(
  '[AI Generation] Generate Image Failure',
  props<{ error: AIError }>()
);

export const updateGenerationProgress = createAction(
  '[AI Generation] Update Progress',
  props<{ progress: GenerationProgress }>()
);

// batch generation actions
export const generateBatch = createAction(
  '[AI Generation] Generate Batch',
  props<{ requests: AIGenerationRequest[] }>()
);

export const generateBatchSuccess = createAction(
  '[AI Generation] Generate Batch Success',
  props<{ responses: AIGenerationResponse[] }>()
);

// history and favorites actions
export const loadGenerationHistory = createAction(
  '[AI Generation] Load History'
);

export const loadGenerationHistorySuccess = createAction(
  '[AI Generation] Load History Success',
  props<{ history: GenerationHistoryItem[] }>()
);

export const saveToHistory = createAction(
  '[AI Generation] Save to History',
  props<{ item: GenerationHistoryItem }>()
);

export const toggleFavorite = createAction(
  '[AI Generation] Toggle Favorite',
  props<{ itemId: string }>()
);

export const clearHistory = createAction(
  '[AI Generation] Clear History'
);

// model management actions
export const switchModel = createAction(
  '[AI Generation] Switch Model',
  props<{ model: AI_MODEL }>()
);

export const updateModelParameters = createAction(
  '[AI Generation] Update Model Parameters',
  props<{ model: AI_MODEL; parameters: any }>()
);

// API status actions
export const checkAPIStatus = createAction(
  '[AI Generation] Check API Status'
);

export const updateAPIStatus = createAction(
  '[AI Generation] Update API Status',
  props<{ provider: 'huggingface' | 'google'; status: any }>()
);

// error handling actions
export const clearError = createAction(
  '[AI Generation] Clear Error'
);

export const retryGeneration = createAction(
  '[AI Generation] Retry Generation'
);

// cancel generation action
export const cancelGeneration = createAction(
  '[AI Generation] Cancel Generation'
);