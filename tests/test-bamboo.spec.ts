import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Bamboo', async ({ page }) => {
  await init(page, 'bamboo', 'Bamboo')

  await page.keyboard.type('chaof')
  await page.keyboard.press('Space')
  await expectText(page, 'chào ')
})
