import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path"
import { VitePWA } from 'vite-plugin-pwa'
const { version } = require("./package.json")

const projectRoot = __dirname

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: true,
          type: 'module'
        },
        includeAssets: [
          "apple-touch-icon.png", 
          "favicon-32x32.png", 
          "favicon-16x16.png", 
          "safari-pinned-tab.svg"
        ],
        manifest: {
          name: "\u4e00\u8d77\u542c\u64ad\u5ba2",
          short_name: "\u4e00\u8d77\u542c\u64ad\u5ba2",
          description: "一起跟好友听播客吧！",
          theme_color: "#282828",
          background_color: "#181818",
          icons: [
            {
              "src": "/android-chrome-192x192.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "/android-chrome-256x256.png",
              "sizes": "256x256",
              "type": "image/png"
            }
          ],
          lang: "zh-CN"
        }
      })
    ],
    server: {
      host: "0.0.0.0"
    },
    resolve: {
      alias: {
        "@": resolve(projectRoot, "src"),
      }
    },
    define: {
      "PT_ENV": {
        "version": version
      }
    }
  }
})
