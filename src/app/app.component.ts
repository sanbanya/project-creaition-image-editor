import { Component, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';
import { AIGenerationPanelComponent } from './components/ai-generation-panel/ai-generation-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    ToolbarComponent,
    ImageEditorComponent,
    AIGenerationPanelComponent
  ],
  template: `
    <div class="app-container">
      <header class="app-header">
        <mat-toolbar class="creaition-toolbar">
          <h1 class="app-title">🎨 Creaition Image Editor</h1>
          <span class="spacer"></span>
          <button mat-button class="creaition-button">
            <mat-icon>save</mat-icon>
            Save
          </button>
          <button mat-button class="creaition-button primary">
            <mat-icon>download</mat-icon>
            Export
          </button>
        </mat-toolbar>
      </header>

      <main class="app-main">
        <app-toolbar (toolSelected)="onToolSelected($event)"></app-toolbar>
        
        <div class="editor-container" (click)="onBackdropClick($event)">
          <app-image-editor #imageEditor></app-image-editor>
          <!-- AI Properties Panel sliding animation -->
          <div class="ai-drawer" [class.open]="aiPanelOpen" (click)="$event.stopPropagation()">
            <app-ai-generation-panel 
              *ngIf="aiPanelOpen"
              [activeTool]="activeTool"
              (imageGenerated)="onImageGenerated($event)"
              class="properties-panel-desktop">
            </app-ai-generation-panel>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class AppComponent {
  title = 'Creaition Image Editor';
  activeTool: string = '';
  aiPanelOpen: boolean = false;

  @ViewChild('imageEditor', { static: false })
  imageEditorComponent!: ImageEditorComponent;

  onToolSelected(tool: string) {
    if (tool === 'ai') {
      // 再次点击AI API时关闭面板
      if (this.aiPanelOpen && this.activeTool === 'ai') {
        this.aiPanelOpen = false;
        this.activeTool = '';
      } else {
        this.aiPanelOpen = true;
        this.activeTool = tool;
      }
    } else {
      this.aiPanelOpen = false;
      this.activeTool = tool;
    }
    console.log('激活工具:', tool);
  }

  // 点击空白区域关闭AI属性面板
  onBackdropClick(event: MouseEvent) {
    // 只在面板打开且点击目标是editor-container时关闭
    if (this.aiPanelOpen && (event.target as HTMLElement).classList.contains('editor-container')) {
      this.aiPanelOpen = false;
      this.activeTool = '';
    }
  }

  // 处理AI生成图片事件
  onImageGenerated(base64: string) {
    if (this.imageEditorComponent) {
  this.imageEditorComponent.onImageGenerated(base64);
    } else {
      // fallback: 延迟重试，确保 imageEditorComponent 已初始化
      console.warn('[app.component] imageEditorComponent undefined, retrying...');
      setTimeout(() => {
        if (this.imageEditorComponent) {
          this.imageEditorComponent.onImageGenerated(base64);
        } else {
          console.error('[app.component] imageEditorComponent still undefined after retry');
        }
      }, 100);
    }
  }
}