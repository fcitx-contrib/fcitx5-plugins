import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Sayura', async ({ page }) => {
  await init(page, 'sayura', 'Sinhala (Sayura)')

  await page.keyboard.type('a')
  await expectText(page, 'අ')
})
