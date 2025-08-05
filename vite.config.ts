import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      insertTypesEntry: true,
      rollupTypes: true,
      outDir: 'dist',
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ApiRecorderDevtools',
      formats: ['es'],
      fileName: (format) => `api-recorder.${format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',   
        'socket.io-client',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'socket.io-client': 'SocketIO',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'api-recorder.css';
          return assetInfo.name || 'assets/[name].[ext]';
        },
      },
    },
    cssCodeSplit: false,
    cssMinify: true,
  },
})
