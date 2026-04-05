// app/api/export-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';

async function getBrowser() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // En production (Vercel, AWS...) : puppeteer-core + chromium serverless
    const puppeteer = await import('puppeteer-core');
    const chromium  = await import('@sparticuz/chromium');
    return puppeteer.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  } else {
    // En local : puppeteer standard (embarque son propre Chromium)
    const puppeteer = await import('puppeteer');
    return puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { html, fileName } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML manquant' }, { status: 400 });
    }

    const browser = await getBrowser();
    const page    = await browser.newPage();

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: white; }
    @page { margin: 0; size: A4; }
    a { color: inherit; text-decoration: none; }
  </style>
</head>
<body>${html}</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      tagged: true,
    });

    await browser.close();

    const safeName = (fileName || 'cv').replace(/[^a-z0-9-_]/gi, '_');
    const buffer   = Buffer.from(pdfBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('[export-pdf]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF : ' + error.message },
      { status: 500 }
    );
  }
}