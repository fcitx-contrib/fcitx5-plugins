import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { clearText, expectCandidate, expectText, init, selectOption } from './util'

function uploadFile(page: Page, path: string) {
  const content = new Uint8Array(readFileSync(`tests/rime/${path}`))
  return page.evaluate(({ content, path }) => {
    // @ts-expect-error fcitx API
    window.fcitx.Module.FS.writeFile(`/home/web_user/.local/share/fcitx5/rime/${path}`, content)
  }, { content, path })
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
  await uploadFile(page, 'rime.lua')
  await uploadFile(page, 'luna_pinyin.custom.yaml')
  await uploadFile(page, 'predict.db')
  // @ts-expect-error fcitx API
  await page.evaluate(() => window.fcitx.Module.FS.mkdir('/home/web_user/.local/share/fcitx5/rime/js'))
  await uploadFile(page, 'js/date_translator.js')
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
