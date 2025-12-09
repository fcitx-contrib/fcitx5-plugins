import { test } from '@playwright/test'
import { expectCandidate, expectText, init } from './util'

test('Kkc', async ({ page }) => {
  await init(page, 'kkc', 'かな漢字')

  await page.keyboard.type('mizu')
  await expectText(page, 'みず')

  await page.keyboard.press(' ')
  await expectText(page, '水')

  await page.keyboard.press(' ')
  await expectCandidate(page, '美津', 2)

  await page.keyboard.press('Enter')

  await expectText(page, '見ず')
})
