import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This is critical for the Gemini SDK to work on the client side
      // It replaces process.env.API_KEY with the actual value from Vercel env vars
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});