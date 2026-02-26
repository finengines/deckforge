/**
 * DeckForge E2E Tests
 * Tests the full application flow using Playwright + Electron
 */

import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test'
import path from 'path'

let app: ElectronApplication
let page: Page

test.beforeAll(async () => {
  app = await electron.launch({
    args: [path.join(__dirname, '../out/main/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'production'
    }
  })
  page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
})

test.afterAll(async () => {
  if (app) await app.close()
})

test.describe('Welcome Screen', () => {
  test('shows app title and new deck button', async () => {
    await expect(page.locator('text=DeckForge')).toBeVisible()
    await expect(page.locator('text=New Deck')).toBeVisible()
  })

  test('creates a new deck', async () => {
    await page.click('text=New Deck')
    // Should show the toolbar with deck name
    await expect(page.locator('text=My Card Deck')).toBeVisible()
    // Should show Design view by default
    await expect(page.locator('text=Design')).toBeVisible()
  })
})

test.describe('Design View', () => {
  test('shows canvas with card dimensions', async () => {
    // Info bar should show card dimensions
    await expect(page.locator('text=62×100mm')).toBeVisible()
    await expect(page.locator('text=Front')).toBeVisible()
    await expect(page.locator('text=0 layers')).toBeVisible()
  })

  test('shows layer panel', async () => {
    await expect(page.locator('text=Layers')).toBeVisible()
  })

  test('shows properties panel', async () => {
    await expect(page.locator('text=Properties')).toBeVisible()
    await expect(page.locator('text=Select a layer to edit')).toBeVisible()
  })

  test('can add a text layer', async () => {
    // Click the T button in the layer panel header
    const addTextBtn = page.locator('.panel-header >> button:has-text("T")').first()
    await addTextBtn.click()
    // Should show 1 layer now
    await expect(page.locator('text=1 layers')).toBeVisible()
    // Layer should appear in the list
    await expect(page.locator('.layer-item')).toHaveCount(1)
  })

  test('can add a shape layer', async () => {
    const addShapeBtn = page.locator('.panel-header >> button:has-text("◻")').first()
    await addShapeBtn.click()
    await expect(page.locator('text=2 layers')).toBeVisible()
    await expect(page.locator('.layer-item')).toHaveCount(2)
  })

  test('can select a layer and see properties', async () => {
    // Click first layer item
    await page.locator('.layer-item').first().click()
    // Properties panel should show position inputs
    await expect(page.locator('text=Position (mm)')).toBeVisible()
    await expect(page.locator('text=Size (mm)')).toBeVisible()
  })

  test('can toggle front/back', async () => {
    await page.click('button:has-text("Back")')
    await expect(page.locator('text=Back')).toBeVisible()
    await expect(page.locator('text=0 layers')).toBeVisible()
    // Go back to front
    await page.click('button:has-text("Front")')
    await expect(page.locator('text=2 layers')).toBeVisible()
  })

  test('can zoom in and out', async () => {
    const zoomText = page.locator('text=100%')
    await expect(zoomText).toBeVisible()
    // Click + button
    await page.locator('button:has-text("+")').first().click()
    await expect(page.locator('text=110%')).toBeVisible()
    // Click - button
    await page.locator('button:has-text("−")').first().click()
    await expect(page.locator('text=100%')).toBeVisible()
  })

  test('can delete a layer', async () => {
    // Click delete button on first layer
    await page.locator('.layer-item >> button:has-text("✕")').first().click()
    await expect(page.locator('text=1 layers')).toBeVisible()
  })
})

test.describe('Cards Panel', () => {
  test('shows empty cards panel', async () => {
    await expect(page.locator('text=Cards (0)')).toBeVisible()
  })

  test('can add a card', async () => {
    await page.click('text=Add First Card')
    await expect(page.locator('text=Cards (1)')).toBeVisible()
    await expect(page.locator('text=New Card')).toBeVisible()
  })

  test('can add more cards', async () => {
    // Click the + button in cards panel header
    const addBtn = page.locator('.panel-header >> button:has-text("+")').first()
    await addBtn.click()
    await expect(page.locator('text=Cards (2)')).toBeVisible()
  })
})

test.describe('Data View', () => {
  test('can switch to data view', async () => {
    await page.click('button:has-text("📊 Data")')
    await expect(page.locator('text=Card Data')).toBeVisible()
  })

  test('shows cards in table', async () => {
    // Should see 2 cards in the table
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(2)
  })

  test('can add a stat category', async () => {
    await page.click('text=+ Add Stat Category')
    await expect(page.locator('text=Stat Categories')).toBeVisible()
    // Should see the new category input
    const catInput = page.locator('input[value="New Stat"]')
    await expect(catInput).toBeVisible()
  })

  test('can rename a category', async () => {
    const catInput = page.locator('input[value="New Stat"]')
    await catInput.fill('Attack Power')
    // Table header should update
    await expect(page.locator('th:has-text("Attack Power")')).toBeVisible()
  })

  test('can enter stat values', async () => {
    // Find stat input in first row
    const statInput = page.locator('tbody tr').first().locator('input[type="number"]').last()
    await statInput.fill('75')
    // Value should be set
    await expect(statInput).toHaveValue('75')
  })

  test('can add another card from data view', async () => {
    await page.click('text=+ Add Card')
    const rows = page.locator('tbody tr')
    await expect(rows).toHaveCount(3)
  })
})

test.describe('Settings View', () => {
  test('can switch to settings view', async () => {
    await page.click('button:has-text("⚙️ Settings")')
    await expect(page.locator('text=Deck Info')).toBeVisible()
  })

  test('shows card dimension presets', async () => {
    await expect(page.locator('text=Card Dimensions')).toBeVisible()
    await expect(page.locator('option:has-text("Top Trumps")')).toBeAttached()
  })

  test('can change card dimensions via preset', async () => {
    await page.locator('select').first().selectOption('poker')
    // Width should update to 63.5
    const widthInput = page.locator('input[type="number"]').first()
    await expect(widthInput).toHaveValue('63.5')
  })

  test('shows AI providers', async () => {
    await expect(page.locator('text=AI Providers')).toBeVisible()
    await expect(page.locator('text=Google Gemini')).toBeVisible()
    await expect(page.locator('text=Ollama (Local)')).toBeVisible()
  })

  test('shows theme colors', async () => {
    await expect(page.locator('text=Deck Theme')).toBeVisible()
    await expect(page.locator('text=Primary')).toBeVisible()
  })
})

test.describe('Export View', () => {
  test('can switch to export view', async () => {
    await page.click('button:has-text("🖨️ Export")')
    await expect(page.locator('text=Export & Print')).toBeVisible()
  })

  test('shows paper settings', async () => {
    await expect(page.locator('text=Paper Settings')).toBeVisible()
    await expect(page.locator('text=Paper Size')).toBeVisible()
    await expect(page.locator('text=Print Alignment')).toBeVisible()
  })

  test('shows export buttons', async () => {
    await expect(page.locator('text=Export PDF')).toBeVisible()
  })

  test('can toggle trim marks', async () => {
    const trimCheckbox = page.locator('input[type="checkbox"]').first()
    await expect(trimCheckbox).toBeChecked()
    await trimCheckbox.uncheck()
    await expect(trimCheckbox).not.toBeChecked()
    await trimCheckbox.check()
  })

  test('can set front/back offset', async () => {
    // Find offset inputs
    const offsetInputs = page.locator('input[type="number"][step="0.5"]')
    await expect(offsetInputs).toHaveCount(4) // 2 front + 2 back
  })
})

test.describe('Navigation', () => {
  test('can navigate back to design view', async () => {
    await page.click('button:has-text("🎨 Design")')
    // Should see canvas
    await expect(page.locator('text=Front')).toBeVisible()
  })

  test('toolbar shows deck name', async () => {
    await expect(page.locator('text=My Card Deck')).toBeVisible()
  })
})
