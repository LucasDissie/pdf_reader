const pdfextract = require('pdf.js-extract');
const grootboeken = require('./ProductenGrootboeken.json');
const express = require('express');
const fs = require('fs');

const port = 5000;
const app = express();

const pdfExtract = new pdfextract.PDFExtract();
var invoices = [];

app.use(express.static('public'))
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
  res.sendFile('./public/index.html', {root: __dirname}); 
});

app.get('/invoices', (req, res) => {        //get requests to the root ("/") will route here
  res.send(invoices);     
});

app.listen(port, () => {            
  console.log(`Now listening on port ${port}`); 
});

function extractData(path) {
  return new Promise((resolve, reject) => {
    const options = {}; // Define your options
    const goodContent = [];

    pdfExtract.extract(path, options, (err, data) => {
      if (err) {
        console.log(err)
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
              if(data.pages[i].content[j].str.includes("RETOUR")){
                goodContent.push("");
                goodContent.push("");
                goodContent.push("");
              }
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


async function getProducts(path) {
  try {
    const goodContent = await extractData(path);
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

// getProducts().then(data => {
//   invoices.push(parseProducts(data));
// }) 


function parseAllInvoices(){
  const directoryPath = './pdfs'; // Replace with the path to your directory
  let fileArray = [];
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
  
    fileArray = files.filter(file => fs.statSync(`${directoryPath}/${file}`).isFile());
    for (let index = 0; index < fileArray.length; index++) {
      getProducts(`./pdfs/${fileArray[index]}`).then(data => {
        invoices.push(parseProducts(data));
      })
    }
  });
}
parseAllInvoices();

