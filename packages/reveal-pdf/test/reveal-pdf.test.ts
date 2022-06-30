import * as plugin from '../src/reveal-pdf';
import { getDocument, PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

jest.mock('pdfjs-dist');

function createElementFromHTML<T extends HTMLElement>(htmlString: string) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstElementChild as T;
}

describe('reveal-pdf', function () {
  const pdf = 'something.pdf';
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

  test.each([
    [pdf, 1],
    [`${pdf}2`, 3]
  ])('add link %#', async function (src, page) {
    const parent = document.createElement('div');    
    const canvas = createElementFromHTML<HTMLCanvasElement>(`<canvas data-pdf-src=${src}></canvas>`);
    if (page != 1) {
      canvas.setAttribute('data-pdf-page', page.toString());
    }
    parent.append(canvas);
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

    await plugin.createPdf(canvas, {addLink: true});
    
    expect(getDocumentMock).toBeCalledWith(src);
    expect(doc.getPage).toBeCalledWith(page);
    expect(getViewport).toBeCalledWith({ scale: 1 });
    expect(render).toBeCalledWith({
      canvasContext: canvas.getContext('2d'),
      undefined,
      viewport: getViewport()
    });

    const children = Array.from(parent.children);
    expect(children).toHaveLength(1);
    expect(children[0]).toBeInstanceOf(HTMLAnchorElement);
    
    const a = children[0] as HTMLAnchorElement;
    expect(a.pathname).toBe(`/${src}`);
    expect(a.hash).toBe(page == 1 ? '' : `#page=${page}`);
    expect(Array.from(a.children)).toStrictEqual([canvas]);
  });

});
