import { test } from '@playwright/test'
import { clearText, expectCandidate, expectText, init } from './util'

test('Skk', async ({ page }) => {
  await init(page, 'skk', 'SKK')

  await page.keyboard.type('mizu')
  await expectText(page, 'みず')

  await clearText(page)
  await page.keyboard.type('Mizu')
  await expectText(page, '▽みず')

  await page.keyboard.press(' ')
  await expectText(page, '▼水')

  await page.keyboard.press(' ')
  await expectText(page, '▼瑞')

  await page.keyboard.press('Enter')
  await expectText(page, '瑞\n')

  await clearText(page)
  await page.keyboard.type('Mi')
  for (const c of '実身未味箕') {
    await page.keyboard.press(' ')
    await expectText(page, `▼${c}`)
  }
  await expectCandidate(page, '御', 3)
  await page.keyboard.press('5')
  await expectText(page, '美')

  // Load user dict.
  await init(page, [], '', 'skk')
  await page.keyboard.type('Mizu ')
  await expectText(page, '▼瑞')
})
