// app/api/extract-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import PdfParser from 'pdf2json';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      return NextResponse.json({ error: 'Seul le PDF est géré par cette route' }, { status: 400 });
    }

    // Créer un fichier temporaire
    const tempFilePath = join(tmpdir(), `${Date.now()}-${file.name}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempFilePath, buffer);

    try {
      // Extraire le texte avec pdf2json
      const text = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PdfParser();
        
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            const text = decodeURIComponent(
              pdfData.Pages
                .map((page: any) => 
                  page.Texts.map((text: any) => 
                    text.R.map((r: any) => r.T).join(' ')
                  ).join(' ')
                ).join('\n')
            );
            resolve(text);
          } catch (err) {
            reject(err);
          }
        });
        
        pdfParser.on('pdfParser_dataError', (err: any) => {
          reject(err);
        });
        
        pdfParser.loadPDF(tempFilePath);
      });

      // Nettoyer le fichier temporaire
      await unlink(tempFilePath).catch(() => {});
      
      const trimmedText = text.trim();
      
      if (!trimmedText) {
        return NextResponse.json(
          { error: 'Ce PDF ne contient pas de texte extractible. Convertissez-le en DOCX ou TXT.' },
          { status: 422 }
        );
      }
      
      return NextResponse.json({ text: trimmedText });
      
    } catch (pdfError: any) {
      // Nettoyer le fichier temporaire en cas d'erreur
      await unlink(tempFilePath).catch(() => {});
      
      console.error('[PDF Parse Error]', pdfError);
      return NextResponse.json(
        { error: 'Impossible de lire ce PDF. Il est peut-être protégé, scanné ou corrompu.' },
        { status: 422 }
      );
    }

  } catch (error: any) {
    console.error('[extract-text]', error);
    return NextResponse.json(
      { error: "Erreur lors de l'extraction : " + error.message },
      { status: 500 }
    );
  }
}