import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { expect } from '@playwright/test'

export async function init(page: Page, plugin: string | string[], im?: string, key?: string, prepare?: () => Promise<any>) {
  await page.goto('http://localhost:9000')
  await expect(page.locator('.my-column > :first-child > * > :nth-child(2) button'), 'Button is enabled on fcitxReady').toBeEnabled()

  if (prepare) {
    await prepare()
  }

  // Install plugin.
  const plugins = Array.isArray(plugin) ? plugin : [plugin]
  if (plugins.length > 0) {
    await page.locator('.my-column > :first-child > * > :nth-child(6)').click()
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('.n-upload-trigger').click(),
    ])

    await fileChooser.setFiles(plugins.map(p => `build/js/${p}.zip`))
    await Promise.all(plugins.map(plugin => expect(page.locator('.n-message').getByText(`Installed ${plugin}`), 'Ensure plugin is installed').toBeVisible()))
    await page.keyboard.press('Escape')
  }

  if (im) {
    // Select IM if it's added by default.
    await page.locator('.my-column > :first-child .n-select').click()
    await page.locator('.n-base-select-option').getByText(im).click()
  }

  if (key) {
    // Programmatically add IM via fcitx API.
    // @ts-expect-error fcitx API
    await page.evaluate(({ key }) => window.fcitx.setInputMethods([key]), { key })
    await page.locator('textarea').click()
  }
}

export async function selectOption(page: Page, option: string) {
  await page.locator('.my-column > :first-child > * > :nth-child(3)').click()
  await page.locator('.n-dropdown-option').getByText(option).click()
}

export function expectCandidate(page: Page, text: string, nth = 0) {
  return expect(page.locator('.fcitx-candidate').nth(nth).locator('.fcitx-text')).toHaveText(new RegExp(`^${text}$`))
}

export function expectText(page: Page, text: string | RegExp) {
  return expect(page.locator('.my-column > :nth-child(2) textarea')).toHaveValue(text)
}

export function clearText(page: Page) {
  return page.locator('.n-input .n-base-icon').click()
}

export function mkdirTree(page: Page, path: string) {
  return page.evaluate(({ path }) => {
    // @ts-expect-error fcitx API
    window.fcitx.Module.FS.mkdirTree(path)
  }, { path })
}

export function uploadFile(page: Page, src: string, dst: string) {
  const content = new Uint8Array(readFileSync(`tests/${src}`))
  return page.evaluate(({ content, dst }) => {
    // @ts-expect-error fcitx API
    window.fcitx.Module.FS.writeFile(dst, content)
  }, { content, dst })
}
