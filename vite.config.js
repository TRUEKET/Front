import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.')

  return {
    plugins: [react()],
    server: {
      // /api 로 시작하는 요청을 백엔드로 전달 (백엔드 경로에는 /api가 없어서 떼고 보냄)
      // 백엔드 경로(/lookup, /report 등)가 화면 경로와 겹치지 않게 /api를 붙여 구분
      // 같은 주소(localhost:5173)로 요청하는 셈이라 세션 쿠키가 그대로 오감
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
