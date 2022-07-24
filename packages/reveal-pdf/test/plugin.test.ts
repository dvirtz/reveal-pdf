const Reveal = require('reveal.js');
import { PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import RevealPdf from '../src/reveal-pdf'
import * as path from 'path';
import * as url from 'url';

describe('plugin', function () {

  test.each([/* false,  */true])('plugin addLink: %s', async function (addLink) {
    document.body.innerHTML = `
    <div class="reveal" style="height: 640px; width: 400px;">
      <div class="slides">
        <section>
          <canvas data-pdf-src=${url.pathToFileURL(path.join(__dirname, 'helloworld.pdf'))} ></canvas>
        </section>
      </div>
    </div>
    `;

    const error = jest.spyOn(console, 'error');

    let deck = new Reveal(document.body.querySelector('.reveal'), { history: true, plugins: [RevealPdf], pdf: { addLink: addLink } });
    await deck.initialize();

    expect(error).not.toBeCalled();

    const canvas = deck.getSlidesElement().querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const events = ctx.__getEvents();
    expect(events).toMatchInlineSnapshot(`
Array [
  Object {
    "props": Object {},
    "transform": Array [
      1,
      0,
      0,
      1,
      0,
      0,
    ],
    "type": "save",
  },
  Object {
    "props": Object {
      "value": "#ffffff",
    },
    "transform": Array [
      1,
      0,
      0,
      1,
      0,
      0,
    ],
    "type": "fillStyle",
  },
  Object {
    "props": Object {
      "height": 200,
      "width": 200,
      "x": 0,
      "y": 0,
    },
    "transform": Array [
      1,
      0,
      0,
      1,
      0,
      0,
    ],
    "type": "fillRect",
  },
]
`);
    if (addLink) {
      expect(canvas.parent).toBeInstanceOf(HTMLAnchorElement);
    }
  });

  test('no pdf elements', async function () {
    document.body.innerHTML = `
    <div class="reveal" style="height: 640px; width: 400px;">
      <div class="slides">
        <section>
          <h1>TITLE</h1>
        </section>
      </div>
    </div>
    `;
    const warn = jest.spyOn(console, 'warn');

    let deck = new Reveal(document.body.querySelector('.reveal'), { plugins: [RevealPdf] });
    await deck.initialize();

    expect(warn).toBeCalledWith('no elements with attribute data-pdf-src found, disabling');
  });

});
