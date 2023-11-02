console.log("test");

let url = "http://localhost:5000/products";
let products = [];
fetch(url).then(function(response) {
  return response.json();
}).then(function(data) {
  products = data;
  populateTable(products);
  calculatePrices(products);
}).catch(function(err) {
  console.log('Fetch Error :-S', err);
});
function populateTable(products){
  let table = document.getElementById("productTable");
  for (let index = 0; index < products.length; index++) {
    let row = document.createElement("tr");
    row.appendChild(document.createElement("td")).innerHTML = products[index].name;
    row.appendChild(document.createElement("td")).innerHTML = products[index].amount;
    row.appendChild(document.createElement("td")).innerHTML = products[index].price;
    row.appendChild(document.createElement("td")).innerHTML = products[index].unit;
    row.appendChild(document.createElement("td")).innerHTML = products[index].tax;
    row.appendChild(document.createElement("td")).innerHTML = products[index].total;
    if(products[index].grootboek == undefined){
      let td = document.createElement("td")
      td.style.backgroundColor = "red";
      row.appendChild(td).innerHTML = products[index].grootboek;
    }
    else{
      row.appendChild(document.createElement("td")).innerHTML = products[index].grootboek;
    }
    if(products[index].statiegeld == undefined){
      let td = document.createElement("td")
      td.style.backgroundColor = "red";
      row.appendChild(td).innerHTML = products[index].grootboek;
    }
    else{
      row.appendChild(document.createElement("td")).innerHTML = products[index].statiegeld;
    }
    table.appendChild(row);
  }
}

function calculatePrices(products){
  let prices = {
    "Mongoose producten": {
      "9 %": 0.0,
      "21 %": 0.0,
      "0 %": 0.0
    },
    "Kamer": {
      "9 %": 0.0,
      "21 %": 0.0,
      "0 %": 0.0
    },
    "Borrels":{
      "9 %": 0.0,
      "21 %": 0.0,
      "0 %": 0.0
    },
    "Emballage":{
      "0 %": 0.0,
      "retour": 0.0
    },
    "Algemene kosten":{
      "9 %": 0.0,
      "21 %": 0.0,
      "0 %": 0.0
    }
  }
  for (let index = 0; index < products.length; index++) {
    if(products[index].grootboek == undefined || products[index].statiegeld == undefined){
      continue
    }
    prices[products[index].grootboek][products[index].tax] += parseFloat(products[index].total.replace(',','.'));
  }
  let table = document.getElementById("totalTable");
  let grootboeken= Object.keys(prices);
  for (let index = 0; index < grootboeken.length; index++) {
    let row = document.createElement("tr");
    row.appendChild(document.createElement("td")).innerHTML = grootboeken[index];
    row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["9 %"].toFixed(2);
    row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["21 %"].toFixed(2);
    row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["0 %"].toFixed(2);
    table.appendChild(row);
    
  }
}