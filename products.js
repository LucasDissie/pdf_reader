const pdfextract = require('pdf.js-extract');
const grootboeken = require('./ProductenGrootboeken.json');

const pdfExtract = new pdfextract.PDFExtract();
var products;

function extractData() {
  return new Promise((resolve, reject) => {
    const options = {}; // Define your options
    const goodContent = [];

    pdfExtract.extract('sample.pdf', options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        let startParsing = false;

        for (let i = 0; i < data.pages.length; i++) {
          for (let j = 0; j < data.pages[i].content.length; j += 1) {
            if (startParsing && data.pages[i].content[j].str.startsWith('Totaal factuurbedrag exclusief')) {
              resolve(goodContent);
              break;
            }
            if (data.pages[i].content[j].str.startsWith('Pag')) {
              startParsing = false;
            }
            if (startParsing && !(data.pages[i].content[j].str === '' || data.pages[i].content[j].str === ' ' || data.pages[i].content[j].str === undefined)) {
              goodContent.push(data.pages[i].content[j].str);
            }
            if (data.pages[i].content[j].str === "Excl. BTW") {
              startParsing = true;
            }
          }
        }
        resolve(goodContent);
      }
    });
  });
}


async function getProducts() {
  try {
    const goodContent = await extractData();
    return goodContent;
  } catch (err) {
    console.error(err);
  }
}

function parseProducts(data) {
  let products = [];
  for (let index = 0; index < data.length; index+=6) {
    products.push({
      name: data[index],
      amount: data[index + 1],
      price: data[index + 2],
      unit: data[index + 3],
      tax: data[index + 4],
      total: data[index + 5],
      grootboek: grootboeken[data[index]]?.grootboek,
      statiegeld: grootboeken[data[index]]?.statiegeld  
    })
  }
  return products;
}

getProducts().then(data => {
  products = parseProducts(data);
  console.log(products);
}) 



