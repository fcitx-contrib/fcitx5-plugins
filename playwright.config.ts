import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  webServer: {
    command: 'npx serve -l 9000 -S fcitx5-online',
    port: 9000,
    reuseExistingServer: true,
  },
})
