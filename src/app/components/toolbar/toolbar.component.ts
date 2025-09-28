import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Output() toolSelected = new EventEmitter<string>();

  tools = [
    // { name: 'crop', label: 'Crop', icon: 'crop' },
    // { name: 'draw', label: 'Draw', icon: 'brush' },
    // { name: 'text', label: 'Text', icon: 'text_fields' },
    // { name: 'shape', label: 'Shape', icon: 'category' },
    // { name: 'filter', label: 'Filter', icon: 'photo_filter' },
    { name: 'ai', label: 'AI API', icon: 'smart_toy' }
  ];

  selectTool(toolName: string) {
    this.toolSelected.emit(toolName);
  }
}