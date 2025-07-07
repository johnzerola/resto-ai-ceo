import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - otimizados
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-select', '@radix-ui/react-popover'],
          'chart-vendor': ['recharts'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'icons-vendor': ['lucide-react'],
          // App chunks - otimizados
          'dashboard': [
            'src/components/dashboard/UnifiedDashboard.tsx',
            'src/hooks/useDashboardData.ts',
            'src/hooks/useOptimizedDashboard.ts'
          ],
          'auth': [
            'src/contexts/AuthContext.tsx',
            'src/components/auth/AuthButton.tsx'
          ],
          'landing': [
            'src/pages/LandingPage.tsx'
          ],
          'restaurant': [
            'src/components/restaurant/PerformanceCharts.tsx'
          ],
          'performance': [
            'src/hooks/usePerformanceOptimization.ts'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@supabase/supabase-js',
      'recharts',
      'lucide-react',
      'react-hook-form',
      'zod'
    ],
    exclude: ['@vite/client', '@vite/env']
  }
}));