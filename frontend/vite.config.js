import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite dev server will proxy API calls to the Spring Boot backend running on 8081
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true
			}
		}
	},
	build: {
		outDir: '../backend/src/main/resources/static',
		emptyOutDir: true
	}
})
