import { test } from '@playwright/test'
import { expectCandidate, expectText, init } from './util'

test('Mizu', async ({ page }) => {
  test.skip(page.context().browser()!.browserType().name() === 'chromium', 'Chromium rejects big wasm executable.')
  await init(page, 'mozc', 'Mozc')

  await page.keyboard.type('m')
  await page.keyboard.type('i')
  await page.keyboard.type('z')
  await page.keyboard.type('u')
  await expectCandidate(page, '水')
  await expectText(page, 'みず')

  await page.keyboard.press(' ')
  await page.keyboard.press('Enter')
  await expectText(page, '水')
})
