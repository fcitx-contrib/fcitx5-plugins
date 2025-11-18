import { test } from '@playwright/test'
import { expectText, init } from './util'

test('Jyutping', async ({ page }) => {
  await init(page, ['chinese-addons', 'jyutping'], 'Jyutping')

  await page.keyboard.type('jyutping')
  await expectText(page, '粵拼')
})
