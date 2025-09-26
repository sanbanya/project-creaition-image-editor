import { createReducer, on } from '@ngrx/store';
import { AIState } from '../../core/models/app-state.models';
import { initialAIState } from '../../core/models/ai-generation.models';
import { GenerationHistoryItem } from '../../core/models/ai-generation.models';
import * as AIActions from './ai-generation.actions';

export const aiGenerationReducer = createReducer(
  initialAIState,
  
  // begin generation
  on(AIActions.generateImage, (state, { request }) => ({
    ...state,
    currentRequest: request,
    isGenerating: true,
      progress: {
        requestId: request.id,
        progress: 0,
        step: 0,
        totalSteps: request.parameters.steps,
        status: 'generating',
        startTime: Date.now(),
        elapsedTime: 0
      },
    error: null
  })),

  // generation success
  on(AIActions.generateImageSuccess, (state, { response }) => ({
    ...state,
    isGenerating: false,
    progress: null,
    currentResponse: response,
    currentRequest: null,
    generationHistory: [
        {
          id: response.id,
          request: state.currentRequest!,
          response: response,
          favorite: false,
          tags: [],
          timestamp: Date.now(),
          viewCount: 0
        },
      ...state.generationHistory.slice(0, 49) // keep max 50 items
    ]
  })),
  
  // generation failure
  on(AIActions.generateImageFailure, (state, { error }) => ({
    ...state,
    isGenerating: false,
    progress: null,
    error: {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp,
      severity: error.severity || 'medium'
    },
    currentRequest: null
  })),
  
  // update progress
  on(AIActions.updateGenerationProgress, (state, { progress }) => ({
    ...state,
    progress: progress.requestId === state.currentRequest?.id ? progress : state.progress
  })),
  
  // switch model
  on(AIActions.switchModel, (state, { model }) => ({
    ...state,
    modelConfig: {
      ...state.modelConfig,
      currentModel: model
    }
  })),
  
  // update model parameters
  on(AIActions.updateModelParameters, (state, { model, parameters }) => ({
    ...state,
    modelConfig: {
      ...state.modelConfig,
      parameters: {
        ...state.modelConfig.parameters,
        [model]: {
          ...state.modelConfig.parameters[model],
          ...parameters
        }
      }
    }
  })),
  
  // switch model
  on(AIActions.toggleFavorite, (state, { itemId }) => {
  const historyIndex = state.generationHistory.findIndex((item: GenerationHistoryItem) => item.id === itemId);
    if (historyIndex === -1) return state;
    
    const updatedHistory = [...state.generationHistory];
    updatedHistory[historyIndex] = {
      ...updatedHistory[historyIndex],
      favorite: !updatedHistory[historyIndex].favorite
    };
    
    const favorites = updatedHistory.filter(item => item.favorite);
    
    return {
      ...state,
      generationHistory: updatedHistory,
      favorites
    };
  }),
  
  // clear error
  on(AIActions.clearError, (state) => ({
    ...state,
    error: {
      code: '',
      message: '',
      timestamp: Date.now(),
      severity: 'low'
    }
  })),
  
  // cancel generation
  on(AIActions.cancelGeneration, (state) => ({
    ...state,
    isGenerating: false,
    progress: null,
    currentRequest: null,
    error: {
      code: 'CANCELLED',
      message: 'Generation cancelled by user',
      timestamp: Date.now(),
      severity: 'low'
    }
  }))
);