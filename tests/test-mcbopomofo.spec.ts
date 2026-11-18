import { expect, test } from '@playwright/test'
import { expectCandidate, expectText, init } from './util'

test('McBopomofo', async ({ page }) => {
  await init(page, 'mcbopomofo', '', 'mcbopomofo')

  await page.keyboard.type('5j4up ')
  await expectText(page, '注音')

  await page.keyboard.press('Enter')
  await page.keyboard.type(' ')
  await expectText(page, '注音 ')
})

test('PlainBopomofo', async ({ page }) => {
  await init(page, 'mcbopomofo', '', 'mcbopomofo-plain')

  await page.keyboard.type('su3')
  await expectCandidate(page, '你')
  await page.keyboard.press('1')
  await expectText(page, '你')

  await page.keyboard.type('cl3')
  await expectCandidate(page, '好')
  await page.keyboard.press('1')
  await expectText(page, '你好')
})

test('McBopomofo date macros', async ({ page }) => {
  await init(page, 'mcbopomofo', '', 'mcbopomofo')

  await page.keyboard.type('rup wu0 ')
  await expectText(page, '今天')
  await page.keyboard.press('ArrowDown')

  // Date candidates require ICU's locale data, not only its stub library.
  await expect(page.locator('.fcitx-candidate .fcitx-text').filter({ hasText: /\d{4}/ }).first()).toBeVisible()
})
