import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    root: "src",
    build: {
        outDir: "../docs",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'src/index.html'),
                utforska: resolve(__dirname, 'src/utforska.html'),
                favoriter: resolve(__dirname, 'src/favoriter.html'),
                'om-oss': resolve(__dirname, 'src/om-oss.html'),
            }
        }
    }
})