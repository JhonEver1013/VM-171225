
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # Test favorites functionality
            await page.goto('http://localhost:8000/index.html')
            await page.wait_for_selector('.btn-add-fav', timeout=5000)
            await page.click('.btn-add-fav')
            await page.screenshot(path='/home/jules/verification/favoritos_before_reload.png')
            await page.reload()
            await page.wait_for_selector('.btn-add-fav.active', timeout=5000)
            await page.screenshot(path='/home/jules/verification/favoritos_after_reload.png')
            await page.goto('http://localhost:8000/favoritos.html')
            await page.wait_for_selector('.producto', timeout=5000)
            await page.screenshot(path='/home/jules/verification/favoritos_page.png')

            # Test cart functionality
            await page.goto('http://localhost:8000/Anillos.html')
            await page.wait_for_selector('.btn-add-cart', timeout=5000)
            await page.click('.btn-add-cart')
            await page.goto('http://localhost:8000/detalle.html?id=1')
            await page.wait_for_selector('#btnAgregarCarrito', timeout=5000)
            await page.click('#btnAgregarCarrito')
            await page.goto('http://localhost:8000/carrito.html')
            await page.wait_for_selector('.carrito-item', timeout=5000)
            await page.screenshot(path='/home/jules/verification/carrito_page.png')

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path='/home/jules/verification/error.png')
        finally:
            await browser.close()

asyncio.run(main())
