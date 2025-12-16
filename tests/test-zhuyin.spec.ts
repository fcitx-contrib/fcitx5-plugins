import { test } from '@playwright/test'
import { expectCandidate, expectText, init } from './util'

test('5j', async ({ page }) => {
  await init(page, 'zhuyin', 'ㄅㄆㄇㄈ')

  await page.keyboard.type('5j')
  await expectText(page, 'ㄓㄨ')

  await page.keyboard.press(' ')
  await expectText(page, '朱')

  await page.keyboard.press('ArrowDown')
  await expectCandidate(page, '竹', 1)

  await page.keyboard.press('4')
  await expectText(page, '珠')
})
