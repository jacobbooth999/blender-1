const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
  await pg.setContent(`<html><body style="margin:0"><script>${fs.readFileSync('mayor.js','utf8')}</script></body></html>`);
  const n = await pg.evaluate(() => MAYORS.length);
  for (let i = 0; i < n; i++) {
    const data = await pg.evaluate((i) => {
      const cw = 600, ch = 1000, cv = document.createElement('canvas'); cv.width = cw * 3; cv.height = ch + 220;
      const g = cv.getContext('2d'); g.fillStyle = '#bfe0f5'; g.fillRect(0, 0, cv.width, cv.height);
      g.fillStyle = '#9fcf7a'; g.fillRect(0, ch - 60, cv.width, 280);
      const m = MAYORS[i];
      for (let k = 0; k < 3; k++) {
        const c = document.createElement('canvas'); c.width = cw; c.height = ch; drawMayor(c, i, k);
        g.drawImage(c, k * cw, 120);
        g.fillStyle = '#241726'; g.font = 'bold 40px sans-serif'; g.textAlign = 'center'; g.fillText(m.props[k][2], k * cw + cw / 2, ch + 190);
      }
      g.textAlign = 'left'; g.font = 'bold 64px sans-serif'; g.fillText(m.name, 30, 70); g.font = '38px sans-serif'; g.fillText(m.tag, 30, 115);
      return cv.toDataURL('image/png');
    }, i);
    fs.writeFileSync(`mayor_${i + 1}.png`, Buffer.from(data.split(',')[1], 'base64'));
  }
  await b.close();
})();
