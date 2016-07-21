var fs = require('fs');
var file = fs.readFileSync('./input.tsv', 'utf8');

var tableObject = parseTable(file);
// console.log(JSON.stringify(tableObject, null, 2));

var flattened = flattenTable(tableObject);

console.log(JSON.stringify(flattened, null, 2));

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
    var groupedTable = {
        rows: []
    };
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
                path.push({
                    title: table[i][p],
                    type: 'row'
                });
            }
            for (var p = 0; p < dataY; p++) {
                path.push({
                    title: table[p][j],
                    type: 'column'
                });
            }

            //create path structure
            var parent = groupedTable.rows;
            for (var p = 0; p < path.length; p++) {

                //find existing child in parent with same title
                var existingChild = null;
                for (var q = 0; q < parent.length; q++) {
                    if (parent[q].title == path[p].title) {
                        existingChild = parent[q];
                        break;
                    }
                }

                //select next parent
                if (existingChild) {
                    parent = existingChild[path[p].type + 's'];
                    if (!parent) parent = existingChild.content;
                } else {

                    //prepare new child that will become next parent
                    var newChild = {
                        title: path[p].title
                    };

                    //if it's the last path component, the content is an object
                    if (p == path.length - 1) {
                        newChild.content = {};
                        parent.push(newChild);
                        parent = newChild.content;
                    } else {
                        newChild[path[p].type + 's'] = [];
                        parent.push(newChild);
                        parent = newChild[path[p].type + 's'];
                    }
                }
            }

            //add value for key to parent
            parent[dataKey] = data;
        }
    }

    return groupedTable;
}


function flattenTable(data) {

    return {
        rowGroups: getRowGroups(data.rows[0]),
        columnGroups: getColumnGroups(data.rows[0]),
        cells: getCells(data)
    };
    
    
    function getCells(data) {
        
        var result = {
            columnsPerRow: 0
        };
        
        //get all cells
        var allCells = getAllCells(data, data, result);
        
        var rows = [];
        var currentRow = [];
        for(var i = 0; i < allCells.length; i++) {
            if(i % result.columnsPerRow == 0) {
                currentRow = [];
                rows.push(currentRow);
            }
            currentRow.push(allCells[i]);
        }
        
        return rows;
        
        
        function getAllCells(data, parent, result) {
            
            var allCells = [];
            
            if(data.rows && data.rows.length) {
                for(var i = 0; i < data.rows.length; i++) {
                    var row = data.rows[i];
                    allCells = allCells.concat(getAllCells(row, data, result));
                }
            }
            else if(data.columns && data.columns.length) {
                for(var i = 0; i < data.columns.length; i++) {
                    var column = data.columns[i];
                    allCells = allCells.concat(getAllCells(column, data, result));
                }
            }
            else if(data.content) {
                
                //extract cells here
                allCells.push(data.content);
                
                //set columns per row
                result.columnsPerRow = parent.columns.length;
            }
            
            return allCells;
        }
    }
    
    function getRowGroups(data) {
        var groups = [];
        if (data.rows && data.rows.length) {
            var group = {
                title: data.title
            };
            groups.push(group);
            var subGroups = [];
            for(var i = 0; i < data.rows.length; i++) {
                subGroups = subGroups.concat(getRowGroups(data.rows[i]));
            }
            if(subGroups.length) group.groups = subGroups;
        }
        return groups;
    }
    
    function getColumnGroups(data) {
        var groups = [];
        
        //drill down the rows
        while(data.rows) {
            data = data.rows[0];
        }
        
        if(data.columns && data.columns.length) {
            var group = {
                title: data.title
            };
            groups.push(group);
            var subGroups = [];
            for(var i = 0; i < data.columns.length; i++) {
                subGroups = subGroups.concat(getColumnGroups(data.columns[i]));
            }
            if(subGroups.length) group.groups = subGroups;
        }
        else if(data.content) {
            var group = {
                title: data.title
            };
            groups.push(group);
        }

        return groups;
    }
}