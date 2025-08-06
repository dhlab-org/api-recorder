import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
import libCss from 'vite-plugin-libcss';

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      vanillaExtractPlugin({ identifiers: 'short' }),
      dts({
        tsconfigPath: './tsconfig.build.json',
        insertTypesEntry: true,
        rollupTypes: true,
        outDir: 'dist',
      }),
      libCss(),
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
      cssCodeSplit: false,
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
      
    },
  };
});
