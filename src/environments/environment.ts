export const environment = {
  production: false,
  
  // Hugging Face API configuration
  huggingFace: {
    apiKey: 'hf_your_api_key_here', // get from environment variables
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: {
      stableDiffusion: 'stabilityai/stable-diffusion-xl-base-1.0',
      qwenImageEdit: 'Qwen/Qwen2.5-VL-7B-Instruct'  // update with actual model name
    },
    rateLimit: 1000
  },
  
  // Google Vertex AI configuration
  googleAI: {
    projectId: 'your-project-id',
    location: 'us-central1',
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
    model: 'imagegeneration@006'
  },
  
  // application settings
  app: {
    maxHistoryItems: 50,
    defaultImageSize: 512,
    supportedFormats: ['image/png', 'image/jpeg', 'image/webp']
  }
};