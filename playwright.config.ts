import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  retries: 3,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  webServer: {
    command: 'npx serve -l 9000 -S fcitx5-online',
    port: 9000,
    reuseExistingServer: true,
  },
})
