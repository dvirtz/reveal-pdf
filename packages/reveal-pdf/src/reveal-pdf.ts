import { getDocument } from "pdfjs-dist";

const defaultOptions: RevealPdfOptions = {
  addLink: false
};

const PDF_SRC_ATTR = 'data-pdf-src';
const PDF_PAGE_ATTR = 'data-pdf-page';
const PDF_SCALE_ATTR = 'data-pdf-scale';

export async function createPdf(canvas: HTMLCanvasElement, options: RevealPdfOptions = {}) {
  const pageNumber = parseInt(canvas.getAttribute(PDF_PAGE_ATTR) ?? '1');
  if (!pageNumber) {
    console.warn(`attribute ${PDF_PAGE_ATTR} is not an integral number on element with ${PDF_SRC_ATTR}=${canvas.getAttribute(PDF_SRC_ATTR)}`);
    return;
  }
  const src = canvas.getAttribute(PDF_SRC_ATTR)!;
  const pdfDoc = await getDocument(src).promise;
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: parseFloat(canvas.getAttribute(PDF_SCALE_ATTR) ?? '1.0') });
  const ctx = canvas.getContext("2d");
  var outputScale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = Math.floor(viewport.width) + "px";
  canvas.style.height =  Math.floor(viewport.height) + "px";

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
    if(pageNumber != 1) {
      a.href += `#page=${pageNumber}`;
    }
    canvas.replaceWith(a);
    a.append(canvas);
  }
}

function init(deck: RevealStatic) {
  const options = Object.assign(defaultOptions, (deck.getConfig() as RevealOptionsWithPdf).pdf ?? {});
  let duringSlideChange = true;
  deck.on('ready', async _ => {
    const pdfCanvases = Array.from(deck.getSlidesElement().querySelectorAll('canvas')).filter(_ => _.hasAttribute(PDF_SRC_ATTR));
    if (!pdfCanvases) {
      console.warn(`no elements with attribute ${PDF_SRC_ATTR} found`);
      return;
    }
    for (const canvas of pdfCanvases) {
      await createPdf(canvas, options);
    }
    Reveal.layout();
  });
}

export default () => {
  return {
    id: 'reveal-pdf',
    init: init
  };
};
