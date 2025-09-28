import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AIState } from '../../core/models/app-state.models';
import { initialAIState } from '../../core/models/ai-generation.models';
import { AIGenerationRequest, AIGenerationResponse, GenerationHistoryItem, AIError, GenerationProgress, AI_MODEL } from '../../core/models/ai-generation.models';

// main feature selector
export const selectAIState = createFeatureSelector<AIState>('ai');

// ============================================================================
// basic state selectors
// ============================================================================

// current generation status
export const selectIsGenerating = createSelector(
  selectAIState,
  (state: AIState) => state.isGenerating
);

export const selectGenerationProgress = createSelector(
  selectAIState,
  (state: AIState) => state.progress
);

export const selectCurrentRequest = createSelector(
  selectAIState,
  (state: AIState) => state.currentRequest
);

export const selectCurrentResponse = createSelector(
  selectAIState,
  (state: AIState) => state.currentResponse
);

// error state
export const selectAIError = createSelector(
  selectAIState,
  (state: AIState) => state.error
);

export const selectHasError = createSelector(
  selectAIError,
  (error: AIError | null) => error !== null
);

export const selectErrorMessage = createSelector(
  selectAIError,
  (error: AIError | null) => error?.message || ''
);

export const selectErrorCode = createSelector(
  selectAIError,
  (error: AIError | null) => error?.code || ''
);

// ============================================================================
// API status selectors
// ============================================================================

export const selectAPIAvailability = createSelector(
  selectAIState,
  (state: AIState) => state.apiStatus.huggingFace.isAvailable
);

export const selectRateLimit = createSelector(
  selectAIState,
  (state: AIState) => state.apiStatus.huggingFace.rateLimit
);

export const selectRemainingRequests = createSelector(
  selectRateLimit,
  (rateLimit) => rateLimit.limit - rateLimit.used
);

export const selectRateLimitUsed = createSelector(
  selectRateLimit,
  (rateLimit) => rateLimit.used
);

export const selectRateLimitTotal = createSelector(
  selectRateLimit,
  (rateLimit) => rateLimit.limit
);

export const selectRateLimitPercentage = createSelector(
  selectRateLimit,
  (rateLimit) => (rateLimit.used / rateLimit.limit) * 100
);

export const selectIsRateLimitExceeded = createSelector(
  selectRemainingRequests,
  (remaining) => remaining <= 0
);

export const selectAPILatency = createSelector(
  selectAIState,
  (state: AIState) => state.apiStatus.huggingFace.latency
);

// ============================================================================
// model configuration selectors
// ============================================================================

export const selectAICurrentModel = createSelector(
  selectAIState,
  (state: AIState) => state.modelConfig.currentModel
);

export const selectAvailableModels = createSelector(
  selectAIState,
  (state: AIState) => state.modelConfig.availableModels
);

export const selectModelParameters = createSelector(
  selectAIState,
  selectAICurrentModel,
  (state: AIState, currentModel: AI_MODEL) => 
    state.modelConfig.parameters[currentModel] || initialAIState.modelConfig.parameters[currentModel]
);

export const selectCurrentModelConfig = createSelector(
  selectAvailableModels,
  selectAICurrentModel,
  (models, currentModel) => models.find(model => model.name === currentModel)
);

export const selectSupportedModes = createSelector(
  selectCurrentModelConfig,
  (modelConfig) => modelConfig?.supportedModes || ['text-to-image']
);

import { MODEL_CONFIGS } from '../../core/models/ai-generation.models';

export const selectDefaultParameters = createSelector(
  selectCurrentModelConfig,
  (modelConfig) => {
    if (modelConfig?.defaultParameters) return modelConfig.defaultParameters;
    // fallback: find in MODEL_CONFIGS
    const fallback = MODEL_CONFIGS.find(m => m.name === 'stable-diffusion');
    return fallback?.defaultParameters;
  }
);

export const selectMaxImageSize = createSelector(
  selectCurrentModelConfig,
  (modelConfig) => modelConfig?.maxSize || 1024
);

// ============================================================================
// history and favorites selectors
// ============================================================================

export const selectGenerationHistory = createSelector(
  selectAIState,
  (state: AIState) => state.generationHistory
);

export const selectFavorites = createSelector(
  selectAIState,
  (state: AIState) => state.favorites
);

export const selectHistoryCount = createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => history.length
);

export const selectFavoritesCount = createSelector(
  selectFavorites,
  (favorites: GenerationHistoryItem[]) => favorites.length
);

export const selectRecentHistory = createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => 
    history
      .slice(0, 10) // recent 10 items
      .sort((a, b) => b.timestamp - a.timestamp)
);

export const selectHistoryByModel = (model: AI_MODEL) => createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => 
    history.filter(item => item.request.model === model)
);

export const selectHistoryByMode = (mode: string) => createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => 
    history.filter(item => item.request.mode === mode)
);

export const selectHistoryWithFavorites = createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => 
    history.filter(item => item.favorite)
);

export const selectHistoryItemById = (id: string) => createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => 
    history.find(item => item.id === id)
);

// ============================================================================
// combination - business logic selectors
// ============================================================================

// if can generate new image
export const selectCanGenerate = createSelector(
  selectIsGenerating,
  selectAPIAvailability,
  selectIsRateLimitExceeded,
  (isGenerating, isAvailable, isRateLimitExceeded) => 
    !isGenerating && isAvailable && !isRateLimitExceeded
);

// generate button state
export const selectGenerateButtonState = createSelector(
  selectCanGenerate,
  selectIsRateLimitExceeded,
  selectAPIAvailability,
  (canGenerate, isRateLimitExceeded, isAvailable) => ({
    disabled: !canGenerate,
    tooltip: !isAvailable ? 'API Unavailable' : 
             isRateLimitExceeded ? 'API call limit exceeded' : 
             'Start generating image'
  })
);

// progress information
export const selectProgressInfo = createSelector(
  selectGenerationProgress,
  (progress: GenerationProgress | null) => {
    if (!progress) return null;
    
    return {
      percentage: progress.progress,
      step: progress.step,
      totalSteps: progress.totalSteps,
      status: progress.status,
      estimatedTimeRemaining: progress.estimatedTimeRemaining,
      isComplete: progress.progress >= 100,
      isInProgress: progress.status === 'generating'
    };
  }
);

// current generation session info
export const selectCurrentGenerationInfo = createSelector(
  selectCurrentRequest,
  selectGenerationProgress,
  selectCurrentResponse,
  (request, progress, response) => ({
    request,
    progress,
    response,
    isActive: !!request,
    hasResult: !!response,
    elapsedTime: request ? Date.now() - request.timestamp : 0
  })
);

// model usage statistics
export const selectModelStatistics = createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => {
    const stats = {
      totalGenerations: history.length,
      byModel: {} as Record<AI_MODEL, number>,
      byMode: {} as Record<string, number>,
      averageGenerationTime: 0,
      mostUsedPrompt: ''
    };

    if (history.length === 0) return stats;

    // by model and mode breakdown
    history.forEach(item => {
      stats.byModel[item.request.model] = (stats.byModel[item.request.model] || 0) + 1;
      stats.byMode[item.request.mode] = (stats.byMode[item.request.mode] || 0) + 1;
    });

    // average generation time
    const totalTime = history.reduce((sum, item) => 
      sum + item.response.metadata.generationTime, 0);
    stats.averageGenerationTime = totalTime / history.length;

    // most used prompt
    const promptCounts = history.reduce((counts, item) => {
      counts[item.request.prompt] = (counts[item.request.prompt] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const mostUsed = Object.entries(promptCounts).reduce((max, [prompt, count]) => 
      count > max.count ? { prompt, count } : max, 
      { prompt: '', count: 0 }
    );

    stats.mostUsedPrompt = mostUsed.prompt;

    return stats;
  }
);

// user preferences
export const selectUserPreferences = createSelector(
  selectAIState,
  (state: AIState) => state.userPreferences
);

export const selectAutoSavePreference = createSelector(
  selectUserPreferences,
  (preferences) => preferences.autoSave
);

export const selectDefaultModelPreference = createSelector(
  selectUserPreferences,
  (preferences) => preferences.defaultModel
);

export const selectImageQualityPreference = createSelector(
  selectUserPreferences,
  (preferences) => preferences.imageQuality
);

// ============================================================================
// filtered and derived selectors
// ============================================================================

export const selectFilteredHistory = (filters: {
  model?: AI_MODEL;
  mode?: string;
  favorite?: boolean;
  dateRange?: { start: Date; end: Date };
  searchTerm?: string;
}) => createSelector(
  selectGenerationHistory,
  (history: GenerationHistoryItem[]) => {
    let filtered = [...history];

    // by model filtering
    if (filters.model) {
      filtered = filtered.filter(item => item.request.model === filters.model);
    }

    // by mode filtering
    if (filters.mode) {
      filtered = filtered.filter(item => item.request.mode === filters.mode);
    }

    // by favorite filtering
    if (filters.favorite !== undefined) {
      filtered = filtered.filter(item => item.favorite === filters.favorite);
    }

    // by date range filtering
    if (filters.dateRange) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end;
      });
    }

    // by search term filtering
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.request.prompt.toLowerCase().includes(searchTerm) ||
        item.request.negativePrompt?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }
);

// ============================================================================
// exported combined selectors
// ============================================================================

// dashboard statistics
export const selectDashboardStats = createSelector(
  selectHistoryCount,
  selectFavoritesCount,
  selectRemainingRequests,
  selectRateLimitTotal,
  selectModelStatistics,
  (historyCount, favoritesCount, remaining, total, stats) => ({
    totalGenerations: historyCount,
    favoritesCount,
    remainingRequests: remaining,
    rateLimitUsage: ((total - remaining) / total) * 100,
    averageGenerationTime: stats.averageGenerationTime,
    mostUsedModel: Object.entries(stats.byModel).reduce((max, [model, count]) => 
      count > max.count ? { model, count } : max, 
      { model: '', count: 0 }
    ).model
  })
);

// settings data for preferences panel
export const selectSettingsData = createSelector(
  selectUserPreferences,
  selectAvailableModels,
  selectAICurrentModel,
  selectRateLimit,
  (preferences, models, currentModel, rateLimit) => ({
    preferences,
    models,
    currentModel,
    rateLimit,
  canChangeModel: (rateLimit.limit - rateLimit.used) > 0 // limit model change if no remaining requests
  })
);

// full panel state for AI generation component
export const selectAIGenerationPanelState = createSelector(
  selectIsGenerating,
  selectGenerationProgress,
  selectCanGenerate,
  selectAIError,
  selectCurrentRequest,
  selectCurrentResponse,
  selectAICurrentModel,
  selectModelParameters,
  selectRateLimit,
  (
    isGenerating, progress, canGenerate, error, 
    currentRequest, currentResponse, currentModel, 
    parameters, rateLimit
  ) => ({
    isGenerating,
    progress,
    canGenerate,
    error,
    currentRequest,
    currentResponse,
    currentModel,
    parameters,
    rateLimit,
    
    // computed flags
    hasActiveGeneration: !!currentRequest,
    hasGenerationResult: !!currentResponse,
    canRetry: !!error && !isGenerating,
    shouldShowProgress: isGenerating && progress !== null
  })
);

// ============================================================================
// tools and utility selectors
// ============================================================================

// check if a specific mode is supported by the current model
export const selectIsModeSupported = (mode: string) => createSelector(
  selectSupportedModes,
  (supportedModes) => supportedModes.includes(mode)
);

// get default parameters for a specific model
export const selectDefaultParametersForModel = (model: AI_MODEL) => createSelector(
  selectAvailableModels,
  (models) => {
    const modelConfig = models.find(m => m.name === model);
    // 修正：defaultParameters 改为 parameters['stable-diffusion']
    return modelConfig?.defaultParameters || initialAIState.modelConfig.parameters['stable-diffusion'];
  }
);

// check if given image size is valid for current model
export const selectIsValidImageSize = (width: number, height: number) => createSelector(
  selectMaxImageSize,
  (maxSize) => width <= maxSize && height <= maxSize
);

// get next unique request ID
export const selectNextRequestId = createSelector(
  selectGenerationHistory,
  (history) => `req_${Date.now()}_${history.length + 1}`
);

// ============================================================================
// debug and development selectors
// ============================================================================

// complete state snapshot (for debugging)
export const selectFullStateSnapshot = createSelector(
  selectAIState,
  (state) => ({
    ...state,
    // hide sensitive data
    generationHistory: state.generationHistory.map(item => ({
      ...item,
      response: {
        ...item.response,
        images: ['[BASE64_DATA_HIDDEN]'] // hide base64 data
      }
    }))
  })
);

// state size information (for performance monitoring)
export const selectStateSizeInfo = createSelector(
  selectAIState,
  (state) => {
    const jsonString = JSON.stringify(state);
    return {
      approximateSize: new Blob([jsonString]).size,
      historyItems: state.generationHistory.length,
      favoriteItems: state.favorites.length
    };
  }
);

export default {
  // basic state
  selectIsGenerating,
  selectGenerationProgress,
  selectCurrentRequest,
  selectCurrentResponse,
  selectAIError,
  selectHasError,
  
  // API status
  selectAPIAvailability,
  selectRateLimit,
  selectRemainingRequests,
  selectIsRateLimitExceeded,

  // model configuration
  selectAICurrentModel,
  selectAvailableModels,
  selectModelParameters,
  selectSupportedModes,

  // history and favorites
  selectGenerationHistory,
  selectFavorites,
  selectHistoryCount,

  // combined selectors
  selectCanGenerate,
  selectGenerateButtonState,
  selectDashboardStats,
  selectAIGenerationPanelState,
  
  // tools and utilities
  selectIsModeSupported,
  selectIsValidImageSize
};