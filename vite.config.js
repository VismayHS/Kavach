import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    define: {
        global: 'globalThis',   // Fix: amazon-cognito-identity-js uses Node's `global`
    },
    server: {
        port: 5173,
        open: true
    }
})
