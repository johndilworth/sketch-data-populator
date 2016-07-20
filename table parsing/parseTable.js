var fs = require('fs');
var file = fs.readFileSync('./input.tsv', 'utf8');

var tableObject = parseTable(file);
console.log(JSON.stringify(tableObject, null, 2));

function parseTable(data) {

    //create 2d table array from tsv
    var table = [];

    //split into rows
    var rowsData = data.split(/\n/g);
    rowsData.forEach(function(rowData) {

        //prepare row
        var row = [];

        //split into columns
        var columnsData = rowData.split(/\t/g);
        columnsData.forEach(function(columnData) {
            columnData = columnData.replace('\r', '').trim();

            //add column to row
            row.push(columnData);
        });

        //add row to table
        table.push(row);
    });

    //find x and y indexes of table data start
    var dataX = 0;
    var dataY = 0;
    while (!table[0][dataX].length) {
        dataX++;
    }
    while (!table[dataY][0].length) {
        dataY++;
    }

    //get data width and height
    var dataWidth = table[0].length - dataX;
    var dataHeight = table.length - dataY;

    //fill missing vertical table group values
    for (var i = 0; i < dataX - 1; i++) {
        var lastPresentValue = null;
        for (var j = dataY; j < dataY + dataHeight; j++) {
            if (table[j][i].length) {
                lastPresentValue = table[j][i];
            } else {
                table[j][i] = lastPresentValue;
            }
        }
    }

    //fill missing horizontal table group values
    for (var i = 0; i < dataY; i++) {
        var lastPresentValue = null;
        for (var j = dataX; j < dataX + dataWidth; j++) {
            if (table[i][j].length) {
                lastPresentValue = table[i][j];
            } else {
                table[i][j] = lastPresentValue;
            }
        }
    }

    //create grouped table of horizontal entries
    var groupedTable = [];
    for (var i = dataY; i < dataY + dataHeight; i++) {
        for (var j = dataX; j < dataX + dataWidth; j++) {

            //get data for table cell
            var data = table[i][j];

            //get data key
            //data keys are always to the left of the data
            var dataKey = table[i][dataX - 1];

            //find path to data
            var path = [];
            for (var p = 0; p < dataX - 1; p++) {
                path.push(table[i][p]);
            }
            for (var p = 0; p < dataY; p++) {
                path.push(table[p][j]);
            }
            
            //create path structure
            var parent = groupedTable;
            for(var p = 0; p < path.length; p++) {
                
                //find existing child in parent with same title
                var existingChild = null;
                for(var q = 0; q < parent.length; q++) {
                    if(parent[q].title == path[p]) {
                        existingChild = parent[q];
                        break;
                    }
                }
                
                //select next parent
                if(existingChild) {
                    parent = existingChild.content;
                }
                else {
                    
                    //prepare new child that will become next parent
                    var newChild = {
                        title: path[p]
                    };
                    
                    //if it's the last path component, the content is an object
                    if(p == path.length - 1) {
                        newChild.content = {};
                    }
                    
                    //otherwise, make content an array
                    else {
                        newChild.content = [];
                    }
                    
                    //add new child to parent and make it the next parent
                    parent.push(newChild);
                    parent = newChild.content;
                }
            }
            
            //add value for key to parent
            parent[dataKey] = data;
        }
    }
    
    return groupedTable;
}