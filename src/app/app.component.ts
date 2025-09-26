import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
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
    RouterOutlet,
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
            保存
          </button>
          <button mat-button class="creaition-button primary">
            <mat-icon>download</mat-icon>
            导出
          </button>
        </mat-toolbar>
      </header>

      <main class="app-main">
        <app-toolbar (toolSelected)="onToolSelected($event)"></app-toolbar>
        
        <div class="editor-container">
          <app-image-editor></app-image-editor>
          
          <!-- 桌面端属性面板 -->
          <app-ai-generation-panel 
            *ngIf="activeTool"
            [activeTool]="activeTool"
            class="properties-panel-desktop">
          </app-ai-generation-panel>
        </div>
      </main>
    </div>
  `,
})
export class AppComponent {
  title = 'Creaition Image Editor';
  activeTool: string = '';

  onToolSelected(tool: string) {
    this.activeTool = tool;
    console.log('激活工具:', tool);
  }
}