import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Hangul', async ({ page }) => {
  await init(page, 'hangul', '한글')

  await page.keyboard.type('gksrmf ')
  await expectText(page, '한글 ')
})
