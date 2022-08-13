import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path"
const { version } = require("./package.json")

const projectRoot = __dirname

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [vue()],
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
