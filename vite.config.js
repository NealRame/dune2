import { defineConfig } from "vite"
import wasm from "vite-plugin-wasm"

export default defineConfig({
    assetsInclude: [
        "**/*.rc",
    ],
    build: {
        target: "esnext",
    },
    plugins: [
        wasm(),
    ],
})