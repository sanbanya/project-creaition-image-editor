# Creaition Image Editor

An online image editor built with Angular and TUI Image Editor. Features cropping, drawing, text, shapes, filters, and AI-powered image generation. Modern UI, easy integration, and responsive design.

---

## Quick Start

1. **Install Node.js (v20.19.3 or above)**
2. **Install dependencies:**
	```bash
	npm install
	```
3. **Start the development server:**
	```bash
	npm start
	```
4. **Build for production:**
	```bash
	npm run build
	```


## API Configuration

1. Edit `src/environments/environment.ts` to set your API keys and endpoints (HuggingFace, Google Imagen, StabilityAI).
2. Required keys for AI image generation:
	- `huggingFace.apiKey`
	- `stabilityAI.apiKey`
	- `googleImagen.apiKey`
3. Ensure your network/firewall allows external API requests.


## Features

- AI-powered image generation (text-to-image, image-to-image, inpainting)
- TUI Image Editor integration (crop, draw, text, shape, filter)
- Canvas editing with Fabric.js
- Toolbar with Material Icons
- Responsive UI (Angular 20 standalone components)
- Customizable SCSS themes
- Generation history & auto-save
- Error handling & status indicators


## How to Use the AI Panel

1. Click the **AI API** button in the toolbar to slide out the AI properties panel from the side.
2. Enter your prompt in the input box and generate AI images.
3. After generation, click **Use this image** to preview and edit the generated image directly in the image editor canvas.
4. You can continue editing the image with all available editor tools.


## Design Decisions

- Angular 20 standalone architecture for modularity and future-proofing
- SCSS with @use for maintainable styles
- TUI Image Editor & Fabric.js for advanced canvas features
- Angular Material Icons for consistent iconography
- Global style application via `ViewEncapsulation.None`
- Environment-based API configuration


## Challenges

- Migrating legacy Angular NgModule code to standalone components
- Ensuring global and third-party styles are correctly applied
- Handling SCSS variable/mixin import errors
- Integrating multiple AI APIs with different authentication/response formats
- Debugging icon rendering issues (Material Icons vs. custom SVG)
- Managing dependency compatibility (Node.js, Angular, third-party libraries)

---

## Any Challenge

- TypeScript compilation issues due to incomplete or conflicting type definitions, and missing/incompatible third-party library typings.
- Node.js compatibility problems, such as inconsistent behavior across Node versions, ESM/CJS import differences, and OS-specific file path/environment variable handling.
- AI logic organization: clarifying the flow between AI generation logic and frontend interaction, responsibilities between state management (store/actions/effects) and services (ai.service.ts), and improving async request, error handling, and result display.

Feel free to add more challenges as the project evolves.

For further questions or contributions, please open an issue or pull request.
# Creaition Image Editor


## Project Introduction
Creaition Image Editor is an online image editor built with Angular and TUI Image Editor. It supports cropping, drawing, text, shapes, filters, and more. The UI is modern and easy to integrate.


## Environment Requirements
- Node.js >= 20.19.0
- npm >= 8.0.0
- Angular CLI >= 15


## Installation Steps
1. Clone the repository:
	```bash
	git clone https://github.com/sanbanya/project-creaition-image-editor.git
	cd creaition-image-editor
	```
2. Install dependencies:
	```bash
	npm install
	```
3. Switch Node.js version (if needed):
	```bash
	nvm install 20.19.3
	nvm use 20.19.3
	```
4. Start the project:
	```bash
	ng serve
	```
	Visit [http://localhost:4200](http://localhost:4200) to view the app.


## Main Dependencies
- @angular/core
- @angular/material
- tui-image-editor
- uuid


## API Integration

### Image Editor Component
**Usage:**
```html
<app-image-editor></app-image-editor>
```
**Toolbar selection event:**
```typescript
onToolSelected(tool: string) {
	// tool: 'crop' | 'draw' | 'text' | 'shape' | 'filter'
}
```

### TUI Image Editor API
Call TUI Image Editor methods in `image-editor.component.ts`:
```typescript
this.imageEditor.loadImageFromURL(url, 'ImageName');
this.imageEditor.crop(...);
this.imageEditor.addText(...);
```
See [TUI Image Editor Documentation](https://github.com/nhn/tui.image-editor) for more APIs.


## Styles & Customization
- Global styles: `src/styles.scss`
- Theme styles: `src/styles/tui-image-editor-theme.scss`
- Customizable SCSS variables and mixins


## Directory Structure
```
creaition-image-editor/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── image-editor/
│   │   │   └── toolbar/
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _mixin.scss
│   │   └── tui-image-editor-theme.scss
│   ├── styles.scss
│   └── index.html
├── angular.json
├── package.json
└── README.md
```


## FAQ
- **Node.js version too low to compile:** Upgrade to 20.19.0 or above.
- **SCSS variable undefined:** Ensure all component style files import `@use` at the top.
- **Angular Material dependency missing:** Run `npm install @angular/material @angular/cdk @angular/animations`.


## License
MIT

---

## Angular CLI Reference

- **Development server:**
	```bash
	ng serve
	```
	Visit [http://localhost:4200](http://localhost:4200) after starting.

- **Code scaffolding:**
	```bash
	ng generate component component-name
	ng generate --help
	```

- **Build:**
	```bash
	ng build
	```
	Build artifacts are stored in the `dist/` directory.

- **Unit tests:**
	```bash
	ng test
	```

- **End-to-end tests:**
	```bash
	ng e2e
	```

For more details, see the [Angular CLI Documentation](https://angular.dev/tools/cli).


## Challenge
TypeScript Compilation Issues

Some type definitions are incomplete or conflicting, causing compilation failures.
Missing or incompatible type declarations for third-party libraries.
The tsconfig configuration needs adjustment according to the project structure.
Node.js Compatibility Issues

Some dependencies behave inconsistently across different Node versions.
ESM/CJS module import methods need to be unified.
File paths and environment variables differ between macOS and Windows.
AI Logic Organization

The interaction flow between AI generation logic and the frontend needs further clarification.
Clear division of responsibilities between state management (store/actions/effects) and services (ai.service.ts).
Asynchronous requests, error handling, and result display need improvement.