import * as plugin from '../src/reveal-pdf';
import { getDocument, PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import * as path from 'path';

jest.mock('pdfjs-dist');

function createElementFromHTML<T extends HTMLElement>(htmlString: string) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstElementChild as T;
}

describe('reveal-pdf', function () {
  const pdf = path.join(__dirname, '..', '..', 'reveal-pdf-demo', 'helloworld.pdf');
  test.each([
    [`data-pdf-src="${pdf}"`, 1.0],
    [`data-pdf-src="${pdf}" data-pdf-scale="2.0"`, 2.0],
  ])('slideData %#', async function (attributes, scale) {
    const canvas = createElementFromHTML<HTMLCanvasElement>(`<canvas ${attributes}></canvas>`);
    const ctx = canvas.getContext('2d');
    const getViewport = jest.fn(() => ({
      width: 42,
      height: 24
    }));
    const render = jest.fn(async () => { });
    const doc = {
      getPage: jest.fn(async () => ({
        getViewport,
        render
      })),
    } as unknown as PDFDocumentProxy;
    const getDocumentMock = jest.mocked(getDocument).mockReturnValue({ promise: Promise.resolve(doc) } as PDFDocumentLoadingTask);
    await plugin.createPdf(canvas);
    expect(getDocumentMock).toBeCalledWith(pdf);
    expect(doc.getPage).toBeCalledWith(1);
    expect(getViewport).toBeCalledWith({ scale });
    expect(render).toBeCalledWith({
      canvasContext: canvas.getContext('2d'),
      undefined,
      viewport: getViewport()
    });
  });
});
