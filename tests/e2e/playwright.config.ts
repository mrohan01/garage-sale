import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'cd ../../mobile-web && CI=1 npx expo start --web --port 8081',
    port: 8081,
    timeout: 120000,
    reuseExistingServer: true,
    stderr: 'pipe',
  },
});
