import { test } from '@playwright/test'
import { expectText, init, mkdirTree, uploadFile } from './util'

test('Keyman', async ({ page }) => {
  await init(page, 'keyman', '', 'keyman:esperanto_sava_eujao', async () => {
    await mkdirTree(page, '/usr/share/keyman/esperanto_sava_eujao')
    await uploadFile(page, 'keyman/esperanto_sava_eujao/kmp.json', '/usr/share/keyman/esperanto_sava_eujao/kmp.json')
    return uploadFile(page, 'keyman/esperanto_sava_eujao/esperanto_sava_eujao.kmx', '/usr/share/keyman/esperanto_sava_eujao/esperanto_sava_eujao.kmx')
  })
  await page.keyboard.type('q')

  await page.keyboard.down('Shift')
  await page.keyboard.type('q')
  await page.keyboard.up('Shift')

  await page.keyboard.down('Control')
  await page.keyboard.down('Shift')
  await page.keyboard.type('q')
  await page.keyboard.up('Shift')
  await page.keyboard.up('Control')

  await page.keyboard.down('Control')
  await page.keyboard.down('Alt')
  await page.keyboard.down('Shift')
  await page.keyboard.type('q')
  await page.keyboard.up('Shift')
  await page.keyboard.up('Alt')
  await page.keyboard.up('Control')

  await expectText(page, '𐑖𐑻ŝŜ')
})
