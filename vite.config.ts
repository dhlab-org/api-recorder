import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  
  return {
    plugins: [
      react(), 
      ...(isDev ? [] : [
        dts({
          tsconfigPath: './tsconfig.build.json',
          insertTypesEntry: true,
          rollupTypes: true,
          outDir: 'dist',
        }),
      ]),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    ...(isDev ? {} : {
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
    }),
  };
});
