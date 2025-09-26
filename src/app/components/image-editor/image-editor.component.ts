import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import ImageEditor from 'tui-image-editor';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  private imageEditor: any;

  ngAfterViewInit() {
    this.initializeImageEditor();
  }

  ngOnDestroy() {
    if (this.imageEditor) {
      this.imageEditor.destroy();
    }
  }

  private initializeImageEditor() {
    this.imageEditor = new ImageEditor(this.editorContainer.nativeElement, {
      includeUI: {
        loadImage: {
          path: 'assets/sample-image.jpg', // 准备一个示例图片
          name: 'SampleImage'
        },
        theme: this.getCustomTheme(),
        menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'mask', 'filter'],
        initMenu: 'filter',
        uiSize: {
          width: '100%',
          height: '800px'
        },
        menuBarPosition: 'bottom'
      },
      cssMaxWidth: 700,
      cssMaxHeight: 500,
      selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
      }
    });
  }

  private getCustomTheme() {
    return {
      'menu.normalIcon.path': '../svg/icon-d.svg',
      'menu.activeIcon.path': '../svg/icon-b.svg',
      'menu.disabledIcon.path': '../svg/icon-a.svg',
      'menu.hoverIcon.path': '../svg/icon-c.svg',
      'submenu.normalIcon.path': '../svg/icon-d.svg',
      'submenu.activeIcon.path': '../svg/icon-c.svg',
      'common.bi.image': '',
      'common.bisize.width': '0px',
      'common.bisize.height': '0px',
      'common.backgroundImage': 'none',
      'common.backgroundColor': '#f0f0f0',
      'common.border': '1px solid #bebebe'
    };
  }

  // 公共方法供其他组件调用
  public getEditorInstance(): any {
    return this.imageEditor;
  }
}