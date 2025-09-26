import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

// NgRx

import * as fromAI from '../../components/ai-generation-panel/ai-generation.selectors';
import * as AIActions from '../../store/ai-generation/ai-generation.actions';
import { AIGenerationRequest, GenerationHistoryItem } from '../../core/models/ai-generation.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-ai-generation-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    
    // Angular Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './ai-generation-panel.component.html',
  styleUrls: ['./ai-generation-panel.component.scss']
})
export class AIGenerationPanelComponent implements OnInit, OnDestroy {
  // Hugging Face API Key from environment
  readonly huggingFaceApiKey = environment.huggingFace.apiKey;
  @Input() activeTool: string = '';
  @Output() imageGenerated = new EventEmitter<string>(); // Base64 image data

  // form group
  generationForm: FormGroup;

  // subscriptions management
  private subscriptions: Subscription = new Subscription();

  // state selectors
  isGenerating$: Observable<boolean>;
  progress$: Observable<any>;
  error$: Observable<any>;
  canGenerate$: Observable<boolean>;
  rateLimit$: Observable<any>;
  currentModel$: Observable<string>;
  generationHistory$: Observable<GenerationHistoryItem[]>;

  // local state
  generationModes = [
    { value: 'text-to-image', label: '文生图', icon: 'text_fields' },
    { value: 'image-to-image', label: '图生图', icon: 'photo' },
    { value: 'inpainting', label: '智能修图', icon: 'healing' }
  ];

  aiModels = [
    { value: 'stable-diffusion', label: 'Stable Diffusion XL', provider: 'huggingface' },
    { value: 'qwen-image-edit', label: 'Qwen Image Edit', provider: 'huggingface' }
  ];

  // preview and mask images
  previewImage: string | null = null;
  maskImage: string | null = null;
  generatedImages: string[] = [];

  // UI state
  advancedSettingsExpanded = false;
  selectedHistoryItem: GenerationHistoryItem | null = null;

  // prompt suggestions
  promptSuggestions = [
    'A beautiful sunset over mountains, digital art',
    'A cute cartoon character in fantasy style',
    'A futuristic city with flying cars',
    'A serene beach with palm trees',
    'An abstract geometric pattern with vibrant colors',
    'A medieval castle in misty forest',
    'A cyberpunk street with neon lights',
    'A peaceful Japanese garden'
  ];

  constructor(
    private store: Store,
    private fb: FormBuilder
  ) {
    // initialize selectors
    this.isGenerating$ = this.store.select(fromAI.selectIsGenerating);
    this.progress$ = this.store.select(fromAI.selectGenerationProgress);
    this.error$ = this.store.select(fromAI.selectAIError);
    this.canGenerate$ = this.store.select(fromAI.selectCanGenerate);
    this.rateLimit$ = this.store.select(fromAI.selectRateLimit);
    this.currentModel$ = this.store.select(fromAI.selectAICurrentModel);
    this.generationHistory$ = this.store.select(fromAI.selectGenerationHistory);

    // initialize form
    this.generationForm = this.createForm();
  }

  ngOnInit() {
    // check API status on init
    this.store.dispatch(AIActions.checkAPIStatus());

    // load generation history
    this.store.dispatch(AIActions.loadGenerationHistory());

    // listen for mode changes
    this.subscriptions.add(
      this.generationForm.get('mode')?.valueChanges.subscribe(mode => {
        this.updateFormValidators(mode);
      })
    );

    // listen for model changes
    this.subscriptions.add(
      this.currentModel$.subscribe(model => {
        this.generationForm.patchValue({ model });
      })
    );

    // listen for generation completion
    this.subscriptions.add(
      this.store.select(fromAI.selectCurrentResponse).subscribe(response => {
        if (response && Array.isArray((response as any).images) && (response as any).images.length > 0) {
          this.generatedImages = (response as any).images;
          // send the first generated image to the editor
          this.imageGenerated.emit((response as any).images[0]);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      mode: ['text-to-image', Validators.required],
      prompt: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      negativePrompt: ['', Validators.maxLength(500)],
      model: ['stable-diffusion', Validators.required],
      width: [512, [Validators.required, Validators.min(64), Validators.max(1024)]],
      height: [512, [Validators.required, Validators.min(64), Validators.max(1024)]],
      steps: [20, [Validators.required, Validators.min(1), Validators.max(50)]],
      guidanceScale: [7.5, [Validators.required, Validators.min(1), Validators.max(20)]],
      strength: [0.8, [Validators.min(0.1), Validators.max(1)]],
      seed: [null],
      numOutputs: [1, [Validators.min(1), Validators.max(4)]]
    });
  }

  private updateFormValidators(mode: string) {
    const strengthControl = this.generationForm.get('strength');
    
    if (mode === 'text-to-image') {
      strengthControl?.clearValidators();
    } else {
      strengthControl?.setValidators([Validators.required, Validators.min(0.1), Validators.max(1)]);
    }
    
    strengthControl?.updateValueAndValidity();
  }

  // generate image
  onGenerate() {
    if (this.generationForm.valid) {
      const formValue = this.generationForm.value;
      
      const request: AIGenerationRequest = {
        id: this.generateRequestId(),
        prompt: formValue.prompt,
        negativePrompt: formValue.negativePrompt || undefined,
        model: formValue.model,
        parameters: {
          width: formValue.width,
          height: formValue.height,
          steps: formValue.steps,
          guidanceScale: formValue.guidanceScale,
          seed: formValue.seed || this.generateSeed(),
          strength: formValue.strength,
          numOutputs: formValue.numOutputs
        },
        inputImage: this.previewImage || undefined,
        maskImage: this.maskImage || undefined,
        timestamp: Date.now(),
        mode: formValue.mode
      };

      this.store.dispatch(AIActions.generateImage({ request }));
    }
  }

  // cancel generation
  onCancel() {
    this.store.dispatch(AIActions.cancelGeneration());
  }

  // retry generation
  onRetry() {
    this.store.dispatch(AIActions.retryGeneration());
  }

  // clear errors
  onClearError() {
    this.store.dispatch(AIActions.clearError());
  }

  // switch model
  onModelChange(model: string) {
    this.store.dispatch(AIActions.switchModel({ 
      model: model as 'stable-diffusion' | 'qwen-image-edit' 
    }));
  }

  // handle image upload
  onImageUpload(event: Event, type: 'input' | 'mask') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // validate file type and size
      if (!this.validateImageFile(file)) {
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        if (type === 'input') {
          this.previewImage = reader.result as string;
        } else {
          this.maskImage = reader.result as string;
        }
      };
      
      reader.readAsDataURL(file);
      input.value = ''; // reset input
    }
  }

  // remove image
  removeImage(type: 'input' | 'mask') {
    if (type === 'input') {
      this.previewImage = null;
    } else {
      this.maskImage = null;
    }
  }

  // use prompt suggestion
  usePromptSuggestion(prompt: string) {
    this.generationForm.patchValue({ prompt });
  }

  // regenerate from history
  regenerateFromHistory(item: GenerationHistoryItem) {
    const request: AIGenerationRequest = {
      ...item.request,
      id: this.generateRequestId(),
      timestamp: Date.now()
    };
    
    this.store.dispatch(AIActions.generateImage({ request }));
    this.selectedHistoryItem = item;
  }

  // toggle favorite
  toggleFavorite(item: GenerationHistoryItem) {
    this.store.dispatch(AIActions.toggleFavorite({ itemId: item.id }));
  }

  // clear history
  clearHistory() {
    this.store.dispatch(AIActions.clearHistory());
  }


  // use generated image
  useGeneratedImage(imageData: string) {
    this.imageGenerated.emit(imageData);
  }

  // download generated image
  downloadImage(image: string, index: number): void {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = image;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // utility functions
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSeed(): number {
    return Math.floor(Math.random() * 1000000);
  }

  private validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert('please upload a valid image file (jpg, png, webp)');
      return false;
    }

    if (file.size > maxSize) {
      alert('image size exceeds 10MB limit');
      return false;
    }

    return true;
  }

  // get mode icon
  getModeIcon(mode: string): string {
    const modeConfig = this.generationModes.find(m => m.value === mode);
    return modeConfig?.icon || 'help';
  }

  // 获取模式标签
  getModeLabel(mode: string): string {
    const modeConfig = this.generationModes.find(m => m.value === mode);
    return modeConfig?.label || mode;
  }

  // 跟踪函数用于ngFor
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}