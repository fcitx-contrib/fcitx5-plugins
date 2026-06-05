import { test } from '@playwright/test'
import { expectCandidate, expectText, init } from './util'

test('Mizu', async ({ page }) => {
  await init(page, 'mozc', 'Mozc')

  await page.keyboard.type('mizu')
  await expectCandidate(page, '水')
  await expectText(page, 'みず')

  await page.keyboard.press(' ')
  await page.keyboard.press('Enter')
  await expectText(page, '水')
})

test('Delete surrounding text', async ({ page }) => {
  await init(page, 'mozc', 'Mozc')

  await page.keyboard.type('neko \n')
  await expectText(page, '猫')
  await page.keyboard.press('Control+Backspace')
  await page.keyboard.press('Escape')
  await expectText(page, 'ねこ')
  await expectCandidate(page, '猫')
})
