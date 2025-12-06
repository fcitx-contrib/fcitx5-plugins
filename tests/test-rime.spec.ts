import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { clearText, expectCandidate, expectText, init, mkdirTree, selectOption, uploadFile } from './util'

function uploadRimeFile(page: Page, path: string) {
  return uploadFile(page, `rime/${path}`, `/home/web_user/.local/share/fcitx5/rime/${path}`)
}

test('Rime', async ({ page }) => {
  test.setTimeout(180000)
  const readyLocator = page.getByText('Rime is ready')
  await init(page, 'rime', 'Rime')

  // Auto deploy
  await expect(page.getByText('Rime is under maintenance')).toBeVisible()
  await page.keyboard.type('.')
  await expectText(page, '.') // Still able to type during deployment.
  await page.keyboard.press('Backspace')
  await expect(readyLocator).toBeVisible({ timeout: 120000 })

  // Simplification
  await page.keyboard.type('fanti')
  await expectCandidate(page, '繁體')
  await page.keyboard.press('Escape')
  await selectOption(page, '漢字 → 汉字')
  await page.keyboard.type('fanti')
  await expectCandidate(page, '繁体')
  await page.keyboard.press('Escape')

  // Redeploy with patches
  await uploadRimeFile(page, 'rime.lua')
  await uploadRimeFile(page, 'luna_pinyin.custom.yaml')
  await uploadRimeFile(page, 'predict.db')
  await mkdirTree(page, '/home/web_user/.local/share/fcitx5/rime/js')
  await uploadRimeFile(page, 'js/date_translator.js')
  await expect(readyLocator).toHaveCount(0)
  // @ts-expect-error fcitx API
  await page.evaluate(() => window.fcitx.setConfig('fcitx://config/addon/rime/deploy', '{}'))
  await expect(readyLocator).toBeVisible({ timeout: 60000 })

  // lua
  await page.keyboard.type('date2')
  await expectText(page, /\d+年\d+月\d+日/)

  // predict
  await clearText(page)
  await page.keyboard.type('wo ')
  await expectCandidate(page, '的')

  // qjs
  await clearText(page)
  await page.keyboard.type('dt ')
  await expectText(page, /\d+\/\d+\/\d+/)
})
