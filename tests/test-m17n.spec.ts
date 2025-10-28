import { test } from '@playwright/test'
import { expectText, init } from './util'

test('M17n', async ({ page }) => {
  await init(page, 'm17n', '', 'm17n_t_math-latex')

  await page.keyboard.type('\\eta')
  await expectText(page, 'η')
})
