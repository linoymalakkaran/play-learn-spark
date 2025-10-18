import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false, // Allow fallback to other ports
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'routing-vendor': ['react-router-dom'],
          'state-vendor': ['zustand'],
          
          // Activity chunks
          'activities-core': [
            './src/components/activities/AnimalSafari',
            './src/components/activities/NumberGarden',
            './src/components/activities/ShapeDetective',
            './src/components/activities/ColorRainbow'
          ],
          'activities-extended': [
            './src/components/activities/FamilyTree',
            './src/components/activities/BodyParts',
            './src/components/activities/WeatherStation',
            './src/components/activities/CountingTrain'
          ],
          'activities-advanced': [
            './src/components/activities/SizeSorter',
            './src/components/activities/Transportation',
            './src/components/activities/EmotionFaces',
            './src/components/activities/PizzaFractions',
            './src/components/activities/PetParade'
          ],
          'activities-languages': [
            './src/components/activities/EnhancedArabicLearning',
            './src/components/activities/EnhancedMalayalamLearning'
          ]
        }
      }
    },
    // Bundle size warnings
    chunkSizeWarningLimit: 500,
    // Enable sourcemaps for production debugging
    sourcemap: mode === 'development',
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'framer-motion',
      'lucide-react'
    ]
  }
}));
