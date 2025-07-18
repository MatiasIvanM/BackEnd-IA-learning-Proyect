import PDFDocument = require('pdfkit');
import fs = require('fs');
import path = require('path');

export const generatePdfBuffer = (content: string): Promise<Buffer> => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const bufferChunks: Buffer[] = [];

    doc.on('data', (chunk) => bufferChunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(bufferChunks)));

    doc.fontSize(14).text(content, {
      align: 'left',
    });

    doc.end();
  });
};

// export const generatePdfFile = (content: string, filename: string): Promise<string> => {
//   return new Promise((resolve) => {
//     const doc = new PDFDocument();
//     // Cambia la ruta aquí:
//     const pdfPath = path.join(__dirname, '../../../generated/informes-calidad', filename);
//     doc.fontSize(18).fillColor('blue').text('Informe de Calidad', { align: 'center' });
//     doc.moveDown();
//     doc.fontSize(14).fillColor('black').text(content, { align: 'left' });

//     doc.end();

//     const stream = fs.createWriteStream(pdfPath);
//     doc.pipe(stream);

//     stream.on('finish', () => resolve(`/informes-calidad/${filename}`));
//   });
// };


export const generatePdfFile = (fullText: string, filename: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const pdfDir = path.join(__dirname, '../../../generated/informes-calidad');
    const pdfPath = path.join(pdfDir, filename);

    // Asegura que la carpeta existe
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    // --- PARSING DEL TEXTO PLANO ---
    // Puedes mejorar estos regex según tu formato real
    const resumen = fullText.match(/Resumen general:(.*?)(Fortalezas:|$)/s)?.[1]?.trim() || '';
    const promedio = parseInt(fullText.match(/Promedio general de cumplimiento.*?(\d+)%/)?.[1] || '0');
    const fortalezas =
      fullText
        .match(/Fortalezas:(.*?)(Oportunidades de mejora:|$)/s)?.[1]
        ?.split('\n')
        .map((f) => f.trim())
        .filter((f) => f) || [];
    const oportunidades =
      fullText
        .match(/Oportunidades de mejora:(.*?)(Recomendaciones:|$)/s)?.[1]
        ?.split('\n')
        .map((o) => o.trim())
        .filter((o) => o) || [];
    const recomendaciones =
      fullText
        .match(/Recomendaciones:(.*?)(Evaluación por Ítem:|$)/s)?.[1]
        ?.split('\n')
        .map((r) => r.trim())
        .filter((r) => r) || [];

    // Ejemplo simple para ítems (mejorar según tu formato)
    const items: Array<{ nombre: string; cumple: string; puntaje: number; justificacion: string }> = [];
    const itemRegex = /(\d+\.\s.*?):\s*(Se cumple|No se cumple|No aplica).*?(\d+)%.*?Justificación:(.*?)(?=\d+\.\s|\n\n|$)/gs;
    let match;
    while ((match = itemRegex.exec(fullText)) !== null) {
      items.push({
        nombre: match[1].trim(),
        cumple: match[2].trim(),
        puntaje: parseInt(match[3]),
        justificacion: match[4].trim(),
      });
    }

    // --- GENERACIÓN DEL PDF ---
    doc.fontSize(22).fillColor('blue').text('Informe de Calidad de Llamada', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).fillColor('black').text(`Resumen General:`, { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(resumen);
    doc.moveDown();
    doc.fontSize(14).text(`Promedio de Cumplimiento: ${promedio}%`, { align: 'left' });
    doc.moveDown();

    doc.fontSize(14).fillColor('green').text('Fortalezas:', { underline: true });
    doc.fontSize(12).fillColor('black').list(fortalezas);
    doc.moveDown();

    doc.fontSize(14).fillColor('orange').text('Oportunidades de Mejora:', { underline: true });
    doc.fontSize(12).fillColor('black').list(oportunidades);
    doc.moveDown();

    doc.fontSize(14).fillColor('blue').text('Recomendaciones:', { underline: true });
    doc.fontSize(12).fillColor('black').list(recomendaciones);
    doc.moveDown();

    doc.fontSize(14).fillColor('black').text('Evaluación por Ítem:', { underline: true });
    doc.moveDown(0.5);

    items.forEach((item) => {
      doc.fontSize(12).fillColor('black').text(`${item.nombre}: ${item.cumple} | Puntaje: ${item.puntaje}%`);
      doc.fontSize(11).fillColor('gray').text(`Justificación: ${item.justificacion}`);
      doc.moveDown(0.5);
    });

    // Create write stream and pipe PDF document
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    doc.end();

    stream.on('finish', () => resolve(`/informes-calidad/${filename}`));
    stream.on('error', (err) => reject(err));
  });
};