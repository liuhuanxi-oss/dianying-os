const { chromium } = require('playwright');
const path = require('path');

async function testMobileResponsive() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X dimensions
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  const results = {
    pages: [],
    errors: []
  };
  
  const basePath = path.resolve(__dirname);
  
  // Test index.html
  console.log('Testing index.html...');
  try {
    await page.goto(`file://${basePath}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const indexIssues = await checkPageIssues(page);
    results.pages.push({
      page: 'index.html',
      url: await page.url(),
      viewport: '375px',
      issues: indexIssues,
      passed: indexIssues.length === 0
    });
    
    await page.screenshot({ path: '/tmp/mobile-screenshots/index-375px.png', fullPage: false });
  } catch (e) {
    results.pages.push({
      page: 'index.html',
      error: e.message
    });
  }
  
  // Test admin.html
  console.log('Testing admin.html...');
  try {
    await page.goto(`file://${basePath}/admin.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Test sidebar toggle
    const menuBtn = await page.$('#mobileMenuToggle');
    if (menuBtn) {
      await menuBtn.click();
      await page.waitForTimeout(500);
    }
    
    const adminIssues = await checkPageIssues(page);
    results.pages.push({
      page: 'admin.html',
      url: await page.url(),
      viewport: '375px',
      issues: adminIssues,
      passed: adminIssues.length === 0
    });
    
    await page.screenshot({ path: '/tmp/mobile-screenshots/admin-375px.png', fullPage: false });
  } catch (e) {
    results.pages.push({
      page: 'admin.html',
      error: e.message
    });
  }
  
  // Test cli-demo.html
  console.log('Testing cli-demo.html...');
  try {
    await page.goto(`file://${basePath}/cli-demo.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const cliIssues = await checkPageIssues(page);
    results.pages.push({
      page: 'cli-demo.html',
      url: await page.url(),
      viewport: '375px',
      issues: cliIssues,
      passed: cliIssues.length === 0
    });
    
    await page.screenshot({ path: '/tmp/mobile-screenshots/cli-demo-375px.png', fullPage: false });
  } catch (e) {
    results.pages.push({
      page: 'cli-demo.html',
      error: e.message
    });
  }
  
  // Collect errors
  results.errors = errors.filter(e => !e.includes('favicon'));
  
  await browser.close();
  
  return results;
}

async function checkPageIssues(page) {
  const issues = [];
  
  // Check for horizontal overflow
  const bodyWidth = await page.evaluate(() => {
    return document.body.scrollWidth;
  });
  
  const windowWidth = await page.evaluate(() => {
    return window.innerWidth;
  });
  
  if (bodyWidth > windowWidth) {
    issues.push(`Horizontal overflow detected: body width ${bodyWidth}px > window width ${windowWidth}px`);
  }
  
  // Check for elements outside viewport
  const overflowElements = await page.evaluate(() => {
    const elements = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth && rect.width > 0) {
        elements.push({
          tag: el.tagName,
          className: el.className,
          right: rect.right,
          width: rect.width
        });
      }
    });
    return elements.slice(0, 5); // Return first 5
  });
  
  if (overflowElements.length > 0) {
    issues.push(`Elements overflowing right: ${JSON.stringify(overflowElements)}`);
  }
  
  return issues;
}

// Run test
testMobileResponsive()
  .then(results => {
    console.log('\n=== Mobile Responsive Test Results ===\n');
    results.pages.forEach(p => {
      console.log(`Page: ${p.page}`);
      console.log(`  Status: ${p.error ? 'ERROR' : (p.passed ? 'PASSED' : 'ISSUES FOUND')}`);
      if (p.url) console.log(`  URL: ${p.url}`);
      if (p.viewport) console.log(`  Viewport: ${p.viewport}`);
      if (p.issues && p.issues.length > 0) {
        console.log(`  Issues:`);
        p.issues.forEach(i => console.log(`    - ${i}`));
      }
      if (p.error) console.log(`  Error: ${p.error}`);
      console.log('');
    });
    
    if (results.errors.length > 0) {
      console.log('Console Errors:');
      results.errors.forEach(e => console.log(`  - ${e}`));
    }
    
    // Save results to file
    const fs = require('fs');
    fs.writeFileSync('/tmp/mobile-optimization-result.md', JSON.stringify(results, null, 2));
    console.log('\nResults saved to /tmp/mobile-optimization-result.md');
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
