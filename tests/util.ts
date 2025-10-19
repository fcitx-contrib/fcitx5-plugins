import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function init(page: Page, plugin: string, im: string) {
  await page.goto('http://localhost:9000')

  // Install plugin.
  await page.locator('.my-column > :first-child div:nth-child(6)').click()
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('.n-upload-trigger').click(),
  ])
  await fileChooser.setFiles([`build/js/${plugin}.zip`])
  await page.keyboard.press('Escape')

  // Select IM.
  await page.locator('.my-column > :first-child .n-select').click()
  await page.locator('.n-base-select-option').getByText(im).click()
}

export function expectCandidate(page: Page, text: string) {
  return expect(page.locator('.fcitx-candidate').first().locator('.fcitx-text')).toHaveText(new RegExp(`^${text}$`))
}

export function expectText(page: Page, text: string) {
  return expect(page.locator('.my-column > :nth-child(2) textarea')).toHaveValue(text)
}
