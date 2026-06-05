import { test } from '@playwright/test'
import { clearText, expectCandidate, expectText, init, selectOption } from './util'

test('Pinyin', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await page.keyboard.type('long')
  await expectCandidate(page, '龙')
  await expectCandidate(page, '🐉', 1)
  await expectCandidate(page, '🐲', 2)
  await expectText(page, 'long')

  await page.keyboard.press(' ')
  await expectText(page, '龙')
})

test('Cloud Pinyin', async ({ page }) => {
  const cloudCandidate = '灼眼的夏娜' // Must be something that is not in the whole candidate list.

  // Intercept cloud pinyin request and mock response
  await page.route('https://www.google.cn/inputtools/request?ime=pinyin&text=zhuo', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        'SUCCESS',
        [
          [
            'zhuo',
            [
              cloudCandidate,
            ],
            [],
            {
              annotation: [
                'zhuo',
              ],
              candidate_type: [
                0,
              ],
              lc: [
                '16',
              ],
            },
          ],
        ],
      ]),
    })
  })
  await init(page, 'chinese-addons', '拼音')

  // Click "Yes" button in the cloud pinyin notification
  await page.locator('.n-button').getByText('Yes').click()

  await page.locator('textarea').click()
  await page.keyboard.type('zhuo')
  await expectCandidate(page, cloudCandidate, 1)
})

test('Predict', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await selectOption(page, 'Prediction Disabled')
  await page.keyboard.type('ke ')
  await expectText(page, '可')
  await expectCandidate(page, '是')

  await page.keyboard.press('1')
  await expectText(page, '可是')
})

test('Stroke filter', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await page.keyboard.type('sheng')
  await expectCandidate(page, '省')
  await page.keyboard.type('`')
  await page.keyboard.type('h')
  await page.keyboard.type('p')
  await expectCandidate(page, '盛')
})

test('Traditional', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await selectOption(page, 'Simplified Chinese')
  await page.keyboard.type('long')
  await expectCandidate(page, '龍')

  await page.keyboard.press(' ')
  await expectText(page, '龍')
})

test('Punctuation', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await page.keyboard.type('x,')
  await expectText(page, '小，')

  await clearText(page)
  await page.keyboard.type('x')
  await page.keyboard.press('Enter')
  await page.keyboard.type(',')
  await expectText(page, 'x,')

  await page.keyboard.press('Backspace')
  await expectText(page, 'x，')

  await clearText(page)
  await selectOption(page, 'Full width punctuation')
  await page.keyboard.type(',')
  await expectText(page, ',')
})

test('Punctuation with surrounding text', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await page.keyboard.insertText('1\n2')
  await page.locator('textarea').click({ position: { x: 30, y: 15 }})
  await page.waitForTimeout(20)
  await page.keyboard.press('.')
  await expectText(page, '1.\n2')
})

test('Full width', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await page.keyboard.type('a')
  await page.keyboard.press('Enter')
  await expectText(page, 'a')

  await clearText(page)
  await selectOption(page, 'Half width Character')
  await page.keyboard.type('a')
  await page.keyboard.press('Enter')
  await expectText(page, 'ａ')
})

test('Pin candidate', async ({ page }) => {
  await init(page, 'chinese-addons', '拼音')

  await page.keyboard.type('ding')
  const second = page.locator('.fcitx-text').nth(1)
  const text = (await second.textContent())!
  await second.click({ button: 'right' })
  await page.getByText('Pin to top as custom phrase').click()
  await expectCandidate(page, text, 0)
})

test('Table', async ({ page }) => {
  await init(page, 'chinese-addons', '', 'wbx')

  await page.keyboard.type('aaaaa')
  await expectCandidate(page, '工')
  await expectText(page, '工a')
})
