import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Thai', async ({ page }) => {
  await init(page, 'thai', 'Thai')

  await page.keyboard.type('l;ylfu')
  await expectText(page, 'สวัสดี')
})
