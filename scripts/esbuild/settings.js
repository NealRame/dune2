import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"

import esbuildPluginTsc from "esbuild-plugin-tsc"
import postCssPlugin from "esbuild-style-plugin"
import vuePlugin from "esbuild-plugin-vue3"
import { copy } from "esbuild-plugin-copy"
import { glsl } from "esbuild-plugin-glsl"
import { wasmLoader as wasm } from "esbuild-plugin-wasm"
import path from "path"

export default function (options) {
    return {
        format: "esm",
        external: [
            "/fonts/*",
        ],
        entryPoints: [
            "src/main.ts",
            "src/style.css",
        ],
        loader: {
            ".rc": "file"
        },
        outdir: "dist",
        bundle: true,
        plugins: [
            copy({
                resolveFrom: "cwd",
                assets: {
                    from: ["public/**/*"],
                    to: ["dist/"],
                }
            }),
            esbuildPluginTsc({
                force: true,
                tsconfig: "tsconfig.json",
            }),
            glsl({
                minify: true,
            }),
            postCssPlugin({
                postcss: {
                    plugins: [tailwindcss, autoprefixer]
                }
                
            }),
            vuePlugin(),
            wasm(),
        ],
        ...options,
    }
}
