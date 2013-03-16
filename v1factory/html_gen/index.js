var sys = require('util');
var tinyliquid = require("tinyliquid");
var _ = require("underscore");
var pageJSON = require('./sample-page.json');
var cssJSON = require('./uie-state.json');
var fs = require('fs');

var NMR_COLUMNS = 12;

function indexElements(elems) {
 _(elems).each(function(elem, ind) {
  elem.index = ind;
 });
 return elems;
}

function createRowsUntil(array, limit) {
  for(var ii = array.length; ii < limit + 1; ii++) {
    var colums = new Array(NMR_COLUMNS);
    array.push(colums);
  }

  return array;
}

function createBitmap(elems) {
  var rows = [];
  
  _(elems).each(function(elem) {
    var layout = elem.layout;
    for(var r = layout.top; r < layout.top + layout.height; r++) {

      if(!rows[r]) rows = createRowsUntil(rows, r);
      
      var row = rows[r];

      for(var c = layout.left; c < layout.left + layout.width; c++) {
        row[c] = elem.index;
      }

    }
  });

  return rows;
}

function generateCSSFile() {

  fs.readFile('./css-template.html', function (err, data) {
    if (err) throw err;
    var output = tinyliquid.render(data.toString(), cssJSON);

    fs.writeFile("./site.css", output, function(err) {
      if(err) throw err;
    }); 
  });
}


function generatePage() {
  fs.readFile('./page-template.html', function (err, data) {
    if (err) throw err;
    console.log(slices);
    var output = tinyliquid.render(data.toString(), { slices : slices });
    fs.writeFile("./generated-page.html", output, function(err) {
      if(err) throw err;
    }); 
  });
}

function isRowEmpty(row) {
  for(var ii = 0; ii < row.length; ii++) { 
    if(row[ii] === 0 || row[ii]) {
      return false;
    }
  }
  return true;
}

function sliceBitmap(bitmap) {

  var slices = [];
  slices[0] = { marginTop : 0, rows: [] };
  curInd = 0;

  var empty = true;

  _(bitmap).each(function(row) {
    if(isRowEmpty(row)) {
      if(empty) {
        slices[curInd].marginTop++;
      }
      else {
        empty = true;
        curInd++;
        slices[curInd] = {marginTop: 1, rows: [] };
      }
    }
    else {
      empty = false;
      slices[curInd].rows.push(row);
    }
  });

  return slices;
}

function mapBitmapToElements(slices) {
  _(slices).each(function(slice){
    var elements = [];
    _(slice.rows).each(function(row) {
      _(row).each(function(elemInd){
        elements.push(elemInd);
      });
    });
    elements = _.uniq(elements);
    slice.elements = elements;
  });

  return slices;
}

function mapIdtoElements(slices, arrayElements) {
  _(slices).each(function(slice){
    _(slice.elements).each(function(elemendInd, ind) {
      //console.log(ind);
      slice.elements[ind] = arrayElements[elemendInd];
    });
  });

  return slices;
}

generateCSSFile();

var UIElements = indexElements(pageJSON.uielements);
var bitmap     = createBitmap(UIElements);
var slices; 

slices = sliceBitmap(bitmap);
slices = mapBitmapToElements(slices);
slices = mapIdtoElements(slices, pageJSON.uielements);

//var slices     = sliceWells();
generatePage();




