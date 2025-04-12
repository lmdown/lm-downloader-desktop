import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  main: {
    build: {
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
      },
    },
    plugins: [
      externalizeDepsPlugin(),
      viteStaticCopy({
        targets: [
          {
            src: 'src/resource/locales/**/*',
            dest: 'locales',
          },
          {
            src: 'src/resource/pages/**/*',
            dest: 'page',
          },
        ],
      }),
    ]
  },
  preload: {
    build: {
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false,
        },
      },
    },
    plugins: [externalizeDepsPlugin()]
  },
  // renderer: {}
})
