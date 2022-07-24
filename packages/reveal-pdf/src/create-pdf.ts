import { getDocument } from 'pdfjs-dist';
import { PDF_PAGE_ATTR, PDF_SCALE_ATTR, PDF_SRC_ATTR } from './constants';


export async function createPdf(canvas: HTMLCanvasElement, options: RevealPdfOptions = {}) {
  const pageNumber = parseInt(canvas.getAttribute(PDF_PAGE_ATTR) ?? '1');
  if (!pageNumber) {
    console.warn(`attribute ${PDF_PAGE_ATTR} is not an integral number on element with ${PDF_SRC_ATTR}=${canvas.getAttribute(PDF_SRC_ATTR)}`);
    return;
  }
  const src = canvas.getAttribute(PDF_SRC_ATTR)!;
  try {
    const ctx = canvas.getContext("2d");
    const pdfDoc = await getDocument(src).promise;
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: parseFloat(canvas.getAttribute(PDF_SCALE_ATTR) ?? '1.0') });
    var outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    var transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : undefined;

    await page.render({
      canvasContext: ctx ?? {},
      transform,
      viewport,
    }).promise;

    if (options.addLink) {
      const a = document.createElement('a');
      a.href = src;
      if (pageNumber != 1) {
        a.href += `#page=${pageNumber}`;
      }
      canvas.replaceWith(a);
      a.append(canvas);
    }
  } catch (err) {
    console.error(`failed to render pdf ${src}: ${err}`);
  }
}
