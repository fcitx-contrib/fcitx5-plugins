import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Date', async ({ page }) => {
  await init(page, ['chinese-addons', 'lua'], '拼音')

  await page.keyboard.type('riqi2')
  await expectText(page, /\d+-\d+-\d+/)
})
