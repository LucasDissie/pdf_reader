let url = "http://localhost:5000/invoices";
let invoices = [];
let currentInvoice = 0;
window.onload = function() { setupElements(); }
fetch(url).then(function(response) {
  return response.json();
}).then(function(data) {
  invoices = data;
  populateTable(invoices[currentInvoice]);
  calculatePrices(invoices[currentInvoice]);
}).catch(function(err) {
  console.log('Fetch Error :-S', err);
});

function setupElements(){
  let next = document.getElementById("next");
  next.addEventListener("click", nextInvoice);
  let previous = document.getElementById("previous");
  previous.addEventListener("click", previousInvoice);
}
function nextInvoice(){
  if(currentInvoice < invoices.length - 1){
    currentInvoice++;
    clearTables();
    populateTable(invoices[currentInvoice]);
    calculatePrices(invoices[currentInvoice]);
  }
  else{
    currentInvoice = 0;
    clearTables();
    populateTable(invoices[currentInvoice]);
    calculatePrices(invoices[currentInvoice]);
  }
}

function previousInvoice(){
  if(currentInvoice > 0){
    currentInvoice--;
    clearTables();
    populateTable(invoices[currentInvoice]);
    calculatePrices(invoices[currentInvoice]);
  }
  else{
    currentInvoice = invoices.length - 1;
    clearTables();
    populateTable(invoices[currentInvoice]);
    calculatePrices(invoices[currentInvoice]);
  }
}

function clearTables(){
  let table = document.getElementById("productTable");
  table.innerHTML = "";
  let totalTable = document.getElementById("totalTable");
  totalTable.innerHTML = "";
}

function populateTable(products){
  let table = document.getElementById("productTable");
  let tr = document.createElement("tr");
  tr.appendChild(document.createElement("th")).innerHTML = "Product";
  tr.appendChild(document.createElement("th")).innerHTML = "Aantal";
  tr.appendChild(document.createElement("th")).innerHTML = "Prijs";
  tr.appendChild(document.createElement("th")).innerHTML = "Eenheid";
  tr.appendChild(document.createElement("th")).innerHTML = "BTW";
  tr.appendChild(document.createElement("th")).innerHTML = "Totaal";
  tr.appendChild(document.createElement("th")).innerHTML = "Grootboek";
  tr.appendChild(document.createElement("th")).innerHTML = "Statiegeld";
  table.appendChild(tr);
  for (let index = 0; index < products.length; index++) {
    let row = document.createElement("tr");
    row.setAttribute("id", index);
    row.appendChild(document.createElement("td")).innerHTML = products[index].name;
    row.appendChild(document.createElement("td")).innerHTML = products[index].amount;
    row.appendChild(document.createElement("td")).innerHTML = products[index].price;
    row.appendChild(document.createElement("td")).innerHTML = products[index].unit;
    row.appendChild(document.createElement("td")).innerHTML = products[index].tax;
    row.appendChild(document.createElement("td")).innerHTML = products[index].total;
    let tgrootboek = document.createElement("td")
    if(products[index].grootboek == undefined){
      tgrootboek.style.backgroundColor = "red";
    }
    tgrootboek.appendChild(grootboekDropdown(products[index].grootboek))
    row.appendChild(tgrootboek)
    let tstatiegeld = document.createElement("td")
    if(products[index].statiegeld == undefined){
      tstatiegeld.style.backgroundColor = "red";
    }
    row.appendChild(tstatiegeld).innerHTML = products[index].grootboek;
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
    "Algemene kosten":{
      "9 %": 0.0,
      "21 %": 0.0,
      "0 %": 0.0
    },
    "Emballage":{
      "0 %": 0.0,
      "Retour": 0.0
    }
  }
  for (let index = 0; index < products.length; index++) {
    if(products[index].grootboek == undefined || products[index].statiegeld == undefined){
      continue
    }
    if(products[index].total.endsWith("-")){
      if(products[index].grootboek == "Emballage"){
        prices[products[index].grootboek]["Retour"] -= parseFloat(products[index].total.replace(',','.'));
      }
      else{
        prices[products[index].grootboek][products[index].tax] -= parseFloat(products[index].total.replace(',','.'));
      }
    }
    else{
      prices[products[index].grootboek][products[index].tax] += parseFloat(products[index].total.replace(',','.'));
    }
  }
  let table = document.getElementById("totalTable");
  let row = document.createElement("tr");
  row.appendChild(document.createElement("th")).innerHTML = "Grootboek";
  row.appendChild(document.createElement("th")).innerHTML = "9 %";
  row.appendChild(document.createElement("th")).innerHTML = "21 %";
  row.appendChild(document.createElement("th")).innerHTML = "0 %";
  row.appendChild(document.createElement("th")).innerHTML = "Retour";
  table.appendChild(row);
  let grootboeken= Object.keys(prices);
  for (let index = 0; index < grootboeken.length; index++) {
    let row = document.createElement("tr");
    if(grootboeken[index] != "Emballage"){
      row.appendChild(document.createElement("td")).innerHTML = grootboeken[index];
      row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["9 %"].toFixed(2);
      row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["21 %"].toFixed(2);
      row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["0 %"].toFixed(2);
      row.appendChild(document.createElement("td")).innerHTML = ""
    }
    else{
      row.appendChild(document.createElement("td")).innerHTML = grootboeken[index];
      row.appendChild(document.createElement("td")).innerHTML = "";
      row.appendChild(document.createElement("td")).innerHTML = "";
      row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["0 %"].toFixed(2);
      row.appendChild(document.createElement("td")).innerHTML = prices[grootboeken[index]]["Retour"].toFixed(2);
    }
    table.appendChild(row);
  }
}

function grootboekDropdown(selectedValue){
  let dropDown = document.createElement("select");
  let options = ["Kamer", "Mongoose producten", "Borrels", "Algemene kosten", "Emballage"];
  for (let index = 0; index < options.length; index++) {
    let option = document.createElement("option");
    option.setAttribute("value", options[index]);
    option.innerHTML = options[index];
    if(options[index] == selectedValue){
      option.selected = true;
    }
    dropDown.appendChild(option);
  }
  dropDown.onchange = changeGrootboek;
    
  return dropDown
}

function changeGrootboek(e){
  invoices[currentInvoice][e.target.parentNode.parentNode.id].grootboek = e.target.value;
  clearTables();
  populateTable(invoices[currentInvoice]);
  calculatePrices(invoices[currentInvoice]);
}