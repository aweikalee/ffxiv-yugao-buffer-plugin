import { defineConfig } from "vite"
import monkey from "vite-plugin-monkey"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.js",
      userscript: {
        name: "FF14 鱼糕增强插件",
        author: "毛呆",
        namespace: "ffxiv-yugao-buffer-plugin",
        match: ["https://fish.ffmomola.com/*"],
        description: "为鱼糕网页版增加自动标记已完成的功能。",
        license: "MIT",
      },
    }),
  ],
})
