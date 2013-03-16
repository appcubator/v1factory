var sys = require('util');
var tinyliquid = require("tinyliquid");
var _ = require("underscore");
var pageJSON = require('./sample-page.json');
var cssJSON = require('./uie-state.json');
var designOptions = require('./design-options.json');
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


  var pageCSSstring = '';

  _(pageJSON.design_props).each(function(val) {
    console.log('oylo');
    var styleString = '';
    options = designOptions[val.type];

    styleString += 'body ' + (this.options.tag||'') + ' {\n  ';
    styleString += options.css.replace(/<%=content%>/g, val.value);
    styleString += '\n} \n\n';

    pageCSSstring += styleString;
  });

  fs.writeFile("./page.css", pageCSSstring, function(err) {
    if(err) throw err;
  });

}


function generatePage() {
  fs.readFile('./page-template.html', function (err, data) {
    if (err) throw err;
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

function isColumnEmpty(rows, i) {
  for(var ii = 0; ii < rows.length; ii++) {
    if(rows[ii][i] === 0 || rows[ii][i]) {
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
  var prevRow = ['x'];

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
    else if(row[0] != prevRow[0] && !empty) {
      empty = true;
      curInd++;
      slices[curInd] = {marginTop: 0, rows: [] };
      slices[curInd].rows.push(row);
    }
    else {
      empty = false;
      slices[curInd].rows.push(row);
    }
    prevRow = row;
  });

  return slices;
}

function transferRows(destRows, fromRows, colInd) {
  if(!destRows) {
    destRows = [];
  }

  for(var ii=0; ii < fromRows.length; ii++) {
    if(!destRows[ii]) destRows[ii] = [];
    destRows[ii].push(fromRows[ii][colInd]);
  }

  return destRows;
}

function columnToArray(rows, colInd) {
  var arr = [];
  for(var ii = 0; ii < rows.length; ii++) {
    if(rows[ii][colInd]) {
      arr.push(rows[ii][colInd]);
    }
  }

  return arr;
}

function sliceIntoColumns(slices) {
  _(slices).each(function(slice) {

    var columns = [];
    columns[0] = { marginLeft : 0, rows: [], width:0};
    curInd = 0;

    for(var ii=0; ii < 12; ii++) {
      if(isColumnEmpty(slice.rows, ii)) {
        if(empty) {
          columns[curInd].marginLeft++;
        }
        else {
          empty = true;
          curInd++;
          columns[curInd] = {marginLeft: 1, rows: [], width: 0 };
        }
      }
      else if(columnToArray(slice.rows, ii-1).toString() != columnToArray(slice.rows, ii).toString() && !empty) {
        // empty = false;
        // curInd++;
        // slices[curInd] = {marginTop: 0, rows: [] };
        // slices[curInd].rows.push(row);
        empty = true;
        curInd++;
        columns[curInd] = {marginLeft: 0, rows: [], width: 1 };
        columns[curInd].rows = transferRows(columns[curInd].rows, slice.rows, ii);
      }
      else {
        empty = false;
        columns[curInd].rows = transferRows(columns[curInd].rows, slice.rows, ii);
        columns[curInd].width++;
        //console.log(columns[curInd].rows);
      }
    }

    slice.columns = columns;
  });

  return slices;
}

function mapBitmapToElements(slices) {
  _(slices).each(function(slice){
    _(slice.columns).each(function(column) {

      var elements = [];
      _(column.rows).each(function(row) {
        _(row).each(function(elemInd){
          elements.push(elemInd);
        });
      });
      elements = _.uniq(elements);
      column.elements = elements;

    });
  });

  return slices;
}

function mapIdtoElements(slices, arrayElements) {
  _(slices).each(function(slice){
    _(slice.columns).each(function(column) {
      _(column.elements).each(function(elemendInd, ind) {
        //console.log(ind);
        column.elements[ind] = arrayElements[elemendInd];
      });
    });
  });

  return slices;
}

generateCSSFile();

var UIElements = indexElements(pageJSON.uielements);
var bitmap     = createBitmap(UIElements);
var slices;

console.log(bitmap);
slices = sliceBitmap(bitmap);
console.log(slices.length);
slices = sliceIntoColumns(slices);
//console.log(slices[2].columns);
//console.log(slices[2].columns[0].rows[0]);

slices = mapBitmapToElements(slices);
slices = mapIdtoElements(slices, pageJSON.uielements);

//var slices     = sliceWells();
generatePage();




