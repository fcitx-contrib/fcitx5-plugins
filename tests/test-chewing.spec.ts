import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Chewing', async ({ page }) => {
  await init(page, 'chewing', '新酷音')

  await page.keyboard.type('5j')
  await expectText(page, 'ㄓㄨ')

  await page.keyboard.type('4')
  await expectText(page, '住')

  await page.keyboard.type('up')
  await expectText(page, '住ㄧㄣ')

  await page.keyboard.press(' ')
  await expectText(page, '注音')

  await page.keyboard.press('Enter')
  await page.keyboard.type(' ')
  await expectText(page, '注音 ')
})
