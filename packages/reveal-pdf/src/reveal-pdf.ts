import { GlobalWorkerOptions } from 'pdfjs-dist';
import { PDF_SRC_ATTR } from './constants';
import { createPdf } from './create-pdf';

setWorkerSource();

const defaultOptions: RevealPdfOptions = {
  addLink: false
};


function setWorkerSource() {
  if (document.currentScript instanceof HTMLScriptElement) {
    const src = document.currentScript.src.replace(/(\.(?:min\.)?js)(\?.*)?$/i, ".worker$1$2");
    GlobalWorkerOptions.workerSrc = src;
  }
}

async function init(deck: RevealStatic) {
  const options = Object.assign(defaultOptions, (deck.getConfig() as RevealOptionsWithPdf).pdf ?? {});
  const pdfCanvases = Array.from(deck.getSlidesElement().querySelectorAll('canvas')).filter(_ => _.hasAttribute(PDF_SRC_ATTR));
  if (!pdfCanvases.length) {
    console.warn(`no elements with attribute ${PDF_SRC_ATTR} found, disabling`);
    return;
  }
  for (const canvas of pdfCanvases) {
    await createPdf(canvas, options);
  }
  deck.layout();
}

export default () => {
  return {
    id: 'reveal-pdf',
    init: init
  };
};
