import { test } from '@playwright/test'
import { expectText, init } from './util'

test('5j', async ({ page }) => {
  await init(page, 'chewing', '新酷音')

  await page.keyboard.type('5j')
  await expectText(page, 'ㄓㄨ')

  await page.keyboard.press(' ')
  await expectText(page, '珠')
})
