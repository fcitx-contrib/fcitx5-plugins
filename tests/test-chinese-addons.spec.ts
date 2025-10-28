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
  await expectCandidate(page, '生')
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
  await expectText(page, '向，')

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

test('Table', async ({ page }) => {
  await init(page, 'chinese-addons', '', 'wbx')

  await page.keyboard.type('aaaaa')
  await expectCandidate(page, '工')
  await expectText(page, '工a')
})
