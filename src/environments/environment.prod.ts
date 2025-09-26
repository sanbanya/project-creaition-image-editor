// Production environment
export const environment = {
  production: true,
  
  huggingFace: {
  apiKey: '', // need to fill in with your own key
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: {
      stableDiffusion: 'stabilityai/stable-diffusion-xl-base-1.0',
      qwenImageEdit: 'Qwen/Qwen2.5-VL-7B-Instruct'
    },
    rateLimit: 1000,
    timeout: 300000
  },
  
  app: {
    version: '1.0.0',
    maxHistoryItems: 50,
    defaultImageSize: 512,
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
    maxFileSize: 10 * 1024 * 1024
  },
  
  features: {
    aiGeneration: true,
    imageEditing: true,
    historyPersistence: true,
    exportFormats: true
  }
};