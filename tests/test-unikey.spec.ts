import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Unikey', async ({ page }) => {
  await init(page, 'unikey', 'Unikey')

  await page.keyboard.type('aa')
  await expectText(page, 'â')
})
