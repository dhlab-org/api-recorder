import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import nested from 'postcss-nested'
import { defineConfig } from 'vite'
import cssInjectedByJs from 'vite-plugin-css-injected-by-js'
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
    cssInjectedByJs(),   
  ],
  css: {
    postcss: {
      plugins: [
        nested(),
      ],
    },
  },
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
      },
    },
    cssCodeSplit: false,
    cssMinify: true,
  },
})
