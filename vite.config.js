import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import os from 'os'

// Get local IP address
const getLocalExternalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const interfaceInfo = interfaces[interfaceName];
    for (const info of interfaceInfo) {
      if (!info.internal && info.family === 'IPv4') {
        return info.address;
      }
    }
  }
  return '0.0.0.0';
};

const localIP = getLocalExternalIP();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: '0.0.0.0', // 모든 네트워크 인터페이스
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certs/privkey.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './certs/fullchain.pem')),
    },
    hmr: {
      host: localIP,
      clientPort: 5173
    },
    allowedHosts: ['localhost', '127.0.0.1', 'ai-tattoo.gknu-comeng.kro.kr', 'gknu-comeng.kro.kr', '.gknu-comeng.kro.kr', localIP],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
