import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Cskk', async ({ page }) => {
  await init(page, 'cskk', 'CSKK')

  await page.keyboard.type('mizu')
  await expectText(page, 'みず')
})
