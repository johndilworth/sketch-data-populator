/**
 * Data library
 *
 * Provides access to data import and processing functionality.
 */


import Context from '../context'


/**
 * Prompts user to select the JSON file and returns the path of the file.
 *
 * @param {string} path - Path to set for the file browser.
 * @returns {string}
 */
export function askForJSON(path) {
  var panel = NSOpenPanel.openPanel()

  panel.setTitle("Select JSON")
  panel.setMessage("Please select the JSON file you'd like to use.")
  panel.setPrompt("Select")
  panel.setCanCreateDirectories(false)
  panel.setCanChooseFiles(true)
  panel.setCanChooseDirectories(false)
  panel.setAllowsMultipleSelection(false)
  panel.setShowsHiddenFiles(false)
  panel.setExtensionHidden(false)

  if (path) {
    panel.setDirectoryURL(NSURL.fileURLWithPath(path))
  }
  else {
    panel.setDirectoryURL(NSURL.fileURLWithPath('/Users/' + NSUserName()))
  }

  var pressedButton = panel.runModal()
  if (pressedButton == NSOKButton) {
    return panel.URL().path()
  }
}


/**
 * Prompts user to select the TSV file and returns the path of the file.
 *
 * @param {string} path - Path to set for the file browser.
 * @returns {string}
 */
export function askForTableTSV(path) {
  var panel = NSOpenPanel.openPanel()

  panel.setTitle("Select TSV")
  panel.setMessage("Please select the TSV file you'd like to use to populate the table.")
  panel.setPrompt("Select")
  panel.setCanCreateDirectories(false)
  panel.setCanChooseFiles(true)
  panel.setCanChooseDirectories(false)
  panel.setAllowsMultipleSelection(false)
  panel.setShowsHiddenFiles(false)
  panel.setExtensionHidden(false)

  if (path) {
    panel.setDirectoryURL(NSURL.fileURLWithPath(path))
  }
  else {
    panel.setDirectoryURL(NSURL.fileURLWithPath('/Users/' + NSUserName()))
  }

  var pressedButton = panel.runModal()
  if (pressedButton == NSOKButton) {
    return panel.URL().path()
  }
}


/**
 * Reads the contexts of a text based file at the provided path.
 *
 * @param {string} path
 * @returns {string}
 */
export function readFileAsText(path) {
  return NSString.stringWithContentsOfFile_encoding_error(path, NSUTF8StringEncoding, false)
}


/**
 * Returns the path to the presets dir.
 *
 * @returns {string}
 */
export function getPresetsDir() {

  //get script path
  var scriptPath = Context().scriptPath

  //get presets dir path
  var presetsDirPath = scriptPath.stringByAppendingPathComponent('/../../../Presets/')
  presetsDirPath = presetsDirPath.stringByStandardizingPath()

  return presetsDirPath
}


/**
 * Loads all presets inside the presets dir.
 *
 * @returns {Array}
 */
export function loadPresets() {

  //get presets path
  var presetsPath = getPresetsDir()

  //create file enumerator for presetsPath
  var url = NSURL.fileURLWithPath(presetsPath)
  var enumerator = NSFileManager.defaultManager().enumeratorAtURL_includingPropertiesForKeys_options_errorHandler(url, [NSURLIsDirectoryKey, NSURLNameKey, NSURLPathKey], NSDirectoryEnumerationSkipsHiddenFiles, null)

  var presets = []
  while (fileUrl = enumerator.nextObject()) {

    //make sure that file is JSON
    if (fileUrl.pathExtension().isEqualToString('json')) {

      //make sure it's a file
      var isDir = MOPointer.alloc().init()
      fileUrl.getResourceValue_forKey_error(isDir, NSURLIsDirectoryKey, null)
      if (!Number(isDir.value())) {

        //get relative path for preset
        var presetPath = fileUrl.path()
        var presetDisplayPath = presetPath.stringByReplacingOccurrencesOfString_withString(presetsPath + '/', '')

        //create preset structure
        var preset = {
          name: String(presetDisplayPath.stringByDeletingPathExtension()),
          path: String(fileUrl.path())
        };

        //add item
        presets.push(preset)
      }
    }
  }

  return presets
}


/**
 * Downloads the image from the specified URL and creates an NSImage instance.
 *
 * @param {string} urlString
 * @returns {NSImage}
 */
export function getImageFromURL(urlString) {

  //get data from url
  var url = NSURL.URLWithString(urlString)
  var data = url.resourceDataUsingCache(false)
  if (!data) return

  //create image from data
  var image = NSImage.alloc().initWithData(data)
  return image
}


/**
 * Loads the JSON file at the specified path and parses and returns its content.
 *
 * @param {string} path
 * @returns {Object/Array}
 */
export function loadJSONData(path) {

  //load contents
  var contents = readFileAsText(path)

  //get data from JSON
  var data
  try {
    data = JSON.parse(contents)
  }
  catch (e) {
    Context().document.showMessage("There was an error parsing data. Please make sure it's valid.")
    return
  }

  return data
}


/**
 * Loads a TSV file and parses its contents into a format that resembles a table.
 *
 * @param {string} path
 * @returns {Object}
 */
export function loadTableTSV(path) {

  //load contents
  var data = readFileAsText(path)

  //create 2d table array from tsv
  var table = []

  //split into rows
  var rowsData = data.split(/\n/g)
  rowsData.forEach(function (rowData) {

    //prepare row
    var row = []

    //split into columns
    var columnsData = rowData.split(/\t/g)
    columnsData.forEach(function (columnData) {
      columnData = columnData.replace('\r', '').trim()

      //add column to row
      row.push(columnData)
    })

    //add row to table
    table.push(row)
  })

  //find x and y indexes of table data start
  var dataX = 0
  var dataY = 0
  while (!table[0][dataX].length) {
    dataX++
  }
  while (!table[dataY][0].length) {
    dataY++
  }

  //get data width and height
  var dataWidth = table[0].length - dataX
  var dataHeight = table.length - dataY

  //fill missing vertical table group values
  for (var i = 0; i < dataX - 1; i++) {
    var lastPresentValue = null
    for (var j = dataY; j < dataY + dataHeight; j++) {
      if (table[j][i].length) {
        lastPresentValue = table[j][i]
      } else {
        table[j][i] = lastPresentValue
      }
    }
  }

  //fill missing horizontal table group values
  for (var i = 0; i < dataY; i++) {
    var lastPresentValue = null
    for (var j = dataX; j < dataX + dataWidth; j++) {
      if (table[i][j].length) {
        lastPresentValue = table[i][j]
      } else {
        table[i][j] = lastPresentValue
      }
    }
  }

  //create grouped table of horizontal entries
  var groupedTable = {
    rows: []
  }
  for (var i = dataY; i < dataY + dataHeight; i++) {
    for (var j = dataX; j < dataX + dataWidth; j++) {

      //get data for table cell
      var data = table[i][j]

      //get data key
      //data keys are always to the left of the data
      var dataKey = table[i][dataX - 1]

      //find path to data
      var path = []
      for (var p = 0; p < dataX - 1; p++) {
        path.push({
          title: table[i][p],
          type: 'row'
        })
      }
      for (var p = 0; p < dataY; p++) {
        path.push({
          title: table[p][j],
          type: 'column'
        })
      }

      //create path structure
      var parent = groupedTable.rows;
      for (var p = 0; p < path.length; p++) {

        //find existing child in parent with same title
        var existingChild = null
        for (var q = 0; q < parent.length; q++) {
          if (parent[q].title == path[p].title) {
            existingChild = parent[q]
            break
          }
        }

        //select next parent
        if (existingChild) {
          parent = existingChild[path[p].type + 's']
          if (!parent) parent = existingChild.content
        } else {

          //prepare new child that will become next parent
          var newChild = {
            title: path[p].title
          }

          //if it's the last path component, the content is an object
          if (p == path.length - 1) {
            newChild.content = {}
            parent.push(newChild)
            parent = newChild.content
          } else {
            newChild[path[p].type + 's'] = []
            parent.push(newChild)
            parent = newChild[path[p].type + 's']
          }
        }
      }

      //add value for key to parent
      parent[dataKey] = data
    }
  }

  return groupedTable
}


/**
 * Flattens the previously parsed TSV table to make populating possible.
 *
 * @param {Object} data
 * @returns {Object}
 */
export function flattenTable(data) {

  //get row groups
  var rowGroups = []
  for (var i = 0; i < data.rows.length; i++) {
    rowGroups = rowGroups.concat(getRowGroups(data.rows[i]))
  }

  //get column groups
  var columnGroups = getColumnGroups(getRootColumns(data.rows[0]))

  //get cells
  var cells = getCells(data)

  //split cells into rows
  var columnCount = getColumnCount(columnGroups)
  var rowCells = []
  var currentRow
  for (var i = 0; i < cells.length; i++) {
    if (i % columnCount == 0) {
      currentRow = []
      rowCells.push(currentRow)
    }
    currentRow.push(cells[i])
  }

  return {
    rowGroups: rowGroups,
    columnGroups: columnGroups,
    cells: rowCells
  }


  function getColumnCount(columnGroups) {

    var count = 0

    for (var i = 0; i < columnGroups.length; i++) {
      var group = columnGroups[i]
      if (group.groups) {
        count += getColumnCount(group.groups)
      }
      else {
        count++
      }
    }

    return count
  }

  function getCells(data, parent) {
    if (!parent) parent = data

    var cells = []

    if (data.rows && data.rows.length) {
      for (var i = 0; i < data.rows.length; i++) {
        var row = data.rows[i]
        cells = cells.concat(getCells(row, data))
      }
    }
    else if (data.columns && data.columns.length) {
      for (var i = 0; i < data.columns.length; i++) {
        var column = data.columns[i]
        cells = cells.concat(getCells(column, data))
      }
    }
    else if (data.content) {

      //extract cells here
      cells.push(data.content)
    }

    return cells
  }

  function getRowGroups(data) {
    var groups = []
    if (data.rows && data.rows.length) {
      var group = {
        title: data.title
      }
      groups.push(group)
      var subGroups = []
      for (var i = 0; i < data.rows.length; i++) {
        subGroups = subGroups.concat(getRowGroups(data.rows[i]))
      }
      if (subGroups.length) group.groups = subGroups
    }
    return groups
  }

  function getRootColumns(data) {

    //drill down the rows
    var parent = data
    while (data.rows) {
      parent = data
      data = data.rows[0]
    }

    return parent.rows
  }

  function getColumnGroups(data) {
    var groups = []

    //process all root columns
    for (var x = 0; x < data.length; x++) {
      var column = data[x]

      //create group
      var group = {
        title: column.title
      }
      groups.push(group)

      //process sub columns
      if (column.columns && column.columns.length) {
        var subGroups = getColumnGroups(column.columns)
        if (subGroups.length) group.groups = subGroups
      }
    }

    return groups
  }
}