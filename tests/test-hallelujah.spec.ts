import { test } from '@playwright/test'
import { expectCandidate, init } from './util'

test('Spell check', async ({ page }) => {
  await init(page, 'hallelujah', 'Hallelujah')

  await page.keyboard.type('excitng')
  await expectCandidate(page, 'exciting', 1)
})

test('Pinyin', async ({ page }) => {
  await init(page, 'hallelujah', 'Hallelujah')

  await page.keyboard.type('meiyou')
  await expectCandidate(page, '没有', 1)
})
