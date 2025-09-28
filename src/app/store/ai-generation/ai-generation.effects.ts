import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom, tap, switchMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as AIActions from './ai-generation.actions';
import { AIService } from '../../services/ai.service';
import { selectAICurrentModel, selectModelParameters } from '../../components/ai-generation-panel/ai-generation.selectors';
import { GenerationProgress } from '../../core/models/ai-generation.models';

@Injectable()
export class AIGenerationEffects {
  // generate image effect
  generateImage$: any;
  saveToHistory$: any;
  checkAPIStatus$: any;
  retryGeneration$: any;

  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private aiService: AIService
  ) {
    this.generateImage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AIActions.generateImage),
        withLatestFrom(
          this.store.select(selectAICurrentModel),
          this.store.select(selectModelParameters)
        ),
        mergeMap(([action, currentModel, parameters]) => {
          const request = {
            ...action.request,
            parameters: { ...(parameters || {}), ...(action.request.parameters || {}) }
          };
          // 开始进度模拟
          this.simulateProgress(request.id, request.parameters.steps);
          return this.aiService.generateImage(request).pipe(
            map(response => AIActions.generateImageSuccess({ response })),
            catchError(error => of(AIActions.generateImageFailure({ error })))
          );
        })
      )
    );

    this.saveToHistory$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AIActions.generateImageSuccess),
        map(({ response }) => {
          // here you can add logic to save to local storage
          return AIActions.saveToHistory({
            item: {
              id: response.id,
              request: {} as any, // should get from state
              response,
              timestamp: response.timestamp || Date.now(),
              favorite: false,
              tags: [],
              viewCount: 0
            }
          });
        })
      )
    );

    this.checkAPIStatus$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AIActions.checkAPIStatus),
        mergeMap(() =>
          this.aiService.checkAllAPIStatus().pipe(
            map(status => AIActions.updateAPIStatus({ provider: 'huggingface', status })),
            catchError(() => of(AIActions.updateAPIStatus({ 
              provider: 'huggingface', 
              status: { isAvailable: false } 
            })))
          )
        )
      )
    );

    this.retryGeneration$ = createEffect(() =>
      this.actions$.pipe(
        ofType(AIActions.retryGeneration),
        withLatestFrom(this.store.select(selectAICurrentModel)),
        map(([action, currentModel]) => {
          // get the last request from error state for retry
          return AIActions.generateImage({
            request: {
              id: Date.now().toString(),
              prompt: 'Retry generation',
              model: currentModel as import('../../core/models/ai-generation.models').AI_MODEL,
              parameters: { width: 512, height: 512, steps: 20, guidanceScale: 7.5 },
              timestamp: Date.now(),
              mode: 'text-to-image'
            }
          });
        })
      )
    );
  }

  // progress simulation (actual API may not support progress queries)
  private simulateProgress(requestId: string, totalSteps: number) {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(95, (currentStep / totalSteps) * 100); // max 95%, waiting for completion
      
      const progressData: GenerationProgress = {
        requestId,
        progress,
        step: currentStep,
        totalSteps,
        status: 'generating',
        startTime: Date.now() - (currentStep * 2000),
        elapsedTime: currentStep * 2000,
        estimatedTimeRemaining: (totalSteps - currentStep) * 2 // assume 2 seconds per step
      };
      
      this.store.dispatch(AIActions.updateGenerationProgress({ progress: progressData }));
      
      if (currentStep >= totalSteps) {
        clearInterval(interval);
      }
    }, 2000); // update every 2 seconds
  }

}