import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      viteStaticCopy({
        targets: [
          {
            src: 'src/resource/locales/**/*', // 指定要复制的源文件路径
            dest: 'locales', // 输出目录中的目标位置
          },
          {
            src: 'src/resource/pages/**/*', // 指定要复制的源文件路径
            dest: 'page', // 输出目录中的目标位置
          },
        ],
      }),
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  // renderer: {}
})
