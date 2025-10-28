import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Mizu', async ({ page }) => {
  await init(page, 'anthy', 'Anthy')

  await page.keyboard.type('mizu')
  await expectText(page, 'みず')

  await page.keyboard.press(' ')
  await page.keyboard.press('Enter')
  await expectText(page, '水')
})
