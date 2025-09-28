import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, retryWhen, delayWhen, tap, timeout } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { environment } from '../../environments/environment';
import { 
  AIGenerationRequest, 
  AIGenerationResponse, 
  AIError,
  AI_MODEL_CONFIG 
} from '../core/models/ai-generation.models';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  /**
   * call Google Imagen API (stub implementation)
   */
  private callGoogleAIAPI(request: AIGenerationRequest, modelConfig: AI_MODEL_CONFIG): Observable<AIGenerationResponse> {
    // TODO: implement Google Imagen API call logic
    return throwError(() => this.createError('NOT_IMPLEMENTED', 'Google Imagen API not implemented'));
  }
  private apiConfig = {
    huggingFace: {
      baseUrl: environment.huggingFace.baseUrl,
      apiKey: environment.huggingFace.apiKey,
      timeout: 300000 // five minutes
    },
    googleAI: {
      baseUrl: `https://${environment.googleAI.apiEndpoint}/v1/projects/${environment.googleAI.projectId}/locations/${environment.googleAI.location}/publishers/google/models`,
      timeout: 300000
    }
  };

  // supported models configuration
  private modelConfigs: { [key: string]: AI_MODEL_CONFIG } = {
    'stable-diffusion': {
      aspectRatios: ['1:1', '16:9', '4:3'],
      supportedSamplers: ['Euler', 'DPMSolver', 'DDIM', 'Karras', 'DPMSolverMultistepScheduler'],
      recommendedParameters: {
        'text-to-image': { steps: 20, guidanceScale: 7.5 },
        'image-to-image': { steps: 15, guidanceScale: 7.0 }
      },
      requiresAuth: false,
      name: 'stable-diffusion',
      displayName: 'Stable Diffusion XL',
      provider: 'huggingface',
      supportedModes: ['text-to-image', 'image-to-image', 'inpainting'],
      defaultParameters: {
        width: 512,
        height: 512,
        steps: 20,
        guidanceScale: 7.5,
        sampler: 'DPMSolverMultistepScheduler'
      },
      maxSize: 1024,
      minSize: 256,
      features: ['high_quality', 'fast_generation'],
      description: 'Stable Diffusion XL is a high-quality text-to-image model.',
      version: '1.0',
      limitations: ['May not support all prompt types.'],
      documentationUrl: '',
    },
    'qwen-image-edit': {
      aspectRatios: ['1:1', '4:3'],
      supportedSamplers: ['Euler', 'DPMSolver'],
      recommendedParameters: {
        'text-to-image': { steps: 25, guidanceScale: 7.0 },
        'image-to-image': { steps: 20, guidanceScale: 6.5 }
      },
      requiresAuth: false,
      name: 'qwen-image-edit',
      displayName: 'Qwen Image Edit',
      provider: 'huggingface',
      supportedModes: ['text-to-image', 'image-to-image'],
      defaultParameters: {
        width: 512,
        height: 512,
        steps: 25,
        guidanceScale: 7.0
      },
      maxSize: 1024,
      minSize: 256,
      features: ['image_editing', 'text_understanding'],
      description: 'Qwen Image Edit is a multimodal image editing model.',
      version: '1.0',
      limitations: ['May not support all edit types.'],
      documentationUrl: '',
    },
    'google-imagen': {
      aspectRatios: ['1:1', '16:9'],
      supportedSamplers: ['DPMSolverMultistepScheduler'],
      recommendedParameters: {
        'text-to-image': { steps: 30, guidanceScale: 8.0 }
      },
      requiresAuth: true,
      name: 'google-imagen',
      displayName: 'Google Imagen',
      provider: 'google',
      supportedModes: ['text-to-image'],
      defaultParameters: {
        width: 512,
        height: 512,
        steps: 30,
        guidanceScale: 8.0
      },
      maxSize: 1024,
      minSize: 256,
      features: ['photorealistic', 'high_resolution'],
      description: 'Google Imagen is a photorealistic text-to-image model.',
      version: '1.0',
        limitations: ['May not support all prompt types.'],
      documentationUrl: '',
    }
  };

  constructor(private http: HttpClient) {}

  /**
   * generate Image
   */
  generateImage(request: AIGenerationRequest): Observable<AIGenerationResponse> {
    const modelConfig = this.modelConfigs[request.model];
    
    if (!modelConfig) {
      return throwError(() => this.createError('UNSUPPORTED_MODEL', `Model ${request.model} is not supported`));
    }

    // validate parameters
    const validationError = this.validateRequest(request, modelConfig);
    if (validationError) {
      return throwError(() => validationError);
    }

    // call respective API based on provider
    switch (modelConfig.provider) {
      case 'huggingface':
        return this.callHuggingFaceAPI(request, modelConfig);
      case 'google':
        return this.callGoogleAIAPI(request, modelConfig);
      default:
        return throwError(() => this.createError('UNSUPPORTED_PROVIDER', `Provider ${modelConfig.provider} is not supported`));
    }
  }

  /**
   * call Hugging Face API
   */
  private callHuggingFaceAPI(request: AIGenerationRequest, modelConfig: AI_MODEL_CONFIG): Observable<AIGenerationResponse> {
    const url = `${this.apiConfig.huggingFace.baseUrl}/${environment.huggingFace.models[request.model as keyof typeof environment.huggingFace.models]}`;
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiConfig.huggingFace.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const payload = this.buildHuggingFacePayload(request);

    return this.http.post<any>(url, payload, { headers }).pipe(
      timeout(this.apiConfig.huggingFace.timeout),
      retryWhen(this.getRetryStrategy()),
      map(response => this.mapHuggingFaceResponse(response, request)),
      catchError(error => this.handleHuggingFaceError(error, request))
    );
  }

  /**
   * build Hugging Face request payload
   */
  private buildHuggingFacePayload(request: AIGenerationRequest): any {
    const basePayload = {
      inputs: request.prompt,
      parameters: {
        width: request.parameters.width,
        height: request.parameters.height,
        num_inference_steps: request.parameters.steps,
        guidance_scale: request.parameters.guidanceScale,
        negative_prompt: request.negativePrompt,
        seed: request.parameters.seed,
        strength: request.parameters.strength
      }
    };

    // by model and mode, adjust payload
    switch (request.mode) {
      case 'image-to-image':
        if (!request.inputImage) {
          throw this.createError('MISSING_INPUT_IMAGE', 'Input image is required for image-to-image generation');
        }
        basePayload.inputs = request.inputImage.replace(/^data:image\/\w+;base64,/, '');
        basePayload.parameters.strength = request.parameters.strength || 0.8;
        break;

      case 'inpainting':
        if (!request.inputImage || !request.maskImage) {
          throw this.createError('MISSING_MASK_IMAGE', 'Input image and mask image are required for inpainting');
        }
        basePayload.inputs = request.inputImage.replace(/^data:image\/\w+;base64,/, '');
  (basePayload.parameters as any)['mask_image'] = request.maskImage.replace(/^data:image\/\w+;base64,/, '');
        break;
    }

    return basePayload;
  }

  /**
   * map Hugging Face response
   */
  private mapHuggingFaceResponse(response: any, request: AIGenerationRequest): AIGenerationResponse {
    // Hugging Face API may return different structures based on model
    let imageData = response.generated_image || response.image;

    // 如果 response 是 base64 字符串，直接用它
    if (typeof response === 'string' && /^[A-Za-z0-9+/=]+$/.test(response.substring(0, 40))) {
      imageData = response;
    }

    if (!imageData) {
      throw this.createError('INVALID_RESPONSE', 'No image data received from API');
    }

    return {
      id: uuidv4(),
      requestId: request.id,
      images: [imageData],
      metadata: {
        generationTime: Date.now() - request.timestamp,
        model: request.model,
        parameters: request.parameters,
        prompt: request.prompt,
        negativePrompt: request.negativePrompt,
        seed: request.parameters.seed ?? 0,
        stepsCompleted: request.parameters.steps,
        totalSteps: request.parameters.steps
      },
      timestamp: Date.now()
    };
  }

  /**
   * check all API status
   */
  checkAllAPIStatus(): Observable<any> {
    return this.http.head(`${this.apiConfig.huggingFace.baseUrl}/stabilityai/stable-diffusion-xl-base-1.0`, {
      headers: { 'Authorization': `Bearer ${this.apiConfig.huggingFace.apiKey}` }
    }).pipe(
      timeout(10000),
      map(() => ({ isAvailable: true, latency: Date.now() })),
      catchError(() => of({ isAvailable: false, latency: -1 }))
    );
  }

  /**
   * get supported models configuration
   */
  getSupportedModels(): AI_MODEL_CONFIG[] {
    return Object.values(this.modelConfigs);
  }

  /**
   * get retry strategy
   */
  private getRetryStrategy() {
    return (errors: Observable<any>) => errors.pipe(
      delayWhen((error, attempt) => {
        // exponential backoff strategy
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        return timer(delay);
      }),
      tap(error => {
        console.warn(`Retrying API call after error:`, error);
      })
    );
  }

  /**
   * validate request parameters
   */
  private validateRequest(request: AIGenerationRequest, modelConfig: AI_MODEL_CONFIG): AIError | null {
    if (!request.prompt || request.prompt.trim().length < 2) {
      return this.createError('INVALID_PROMPT', 'Prompt must be at least 2 characters long');
    }

    if (request.parameters.width > modelConfig.maxSize || request.parameters.height > modelConfig.maxSize) {
      return this.createError('INVALID_SIZE', `Image size cannot exceed ${modelConfig.maxSize}x${modelConfig.maxSize}`);
    }

    if (!modelConfig.supportedModes.includes(request.mode)) {
      return this.createError('UNSUPPORTED_MODE', `Mode ${request.mode} is not supported for this model`);
    }

    return null;
  }

  /**
   * handle Hugging Face errors
   */
  private handleHuggingFaceError(error: HttpErrorResponse, request: AIGenerationRequest): Observable<never> {
    let aiError: AIError;

    if (error.status === 401) {
      aiError = this.createError('AUTHENTICATION_FAILED', 'Invalid API key');
    } else if (error.status === 429) {
      aiError = this.createError('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please try again later.');
    } else if (error.status === 503) {
      aiError = this.createError('MODEL_LOADING', 'Model is loading. Please try again in a few moments.');
    } else {
      aiError = this.createError('API_ERROR', error.message || 'Unknown API error');
    }

    aiError.details = {
      status: error.status,
      url: error.url,
      requestId: request.id
    };

    return throwError(() => aiError);
  }

  /**
   * create AIError object
   */
  private createError(code: string, message: string): AIError {
    return {
      code,
      message,
      timestamp: Date.now(),
      severity: 'medium'
    };
  }
}