import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('CONSOLE LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    console.log("Navigating to http://localhost:5173...");
    await page.goto('http://localhost:5173', { waitUntil: 'load' });
    console.log("Navigation finished.");
    await new Promise(r => setTimeout(r, 3000));

    const content = await page.content();
    fs.writeFileSync('page_dump.html', content);
    console.log("Dumped HTML to page_dump.html");

    await browser.close();
})();
