/**
 * Layers library
 *
 * Provides functionality to get, find, check or otherwise manipulate layers.
 */


import Context from '../context'
import * as Utils from './utils';


/**
 * Finds layers with specified name in the root layer. The name can be set to '*'
 * and exactMatch to false, in which case all layers are returned.
 *
 * @param {string} name
 * @param {bool} exactMatch
 * @param {string} type
 * @param {MSLayer} rootLayer
 * @param {bool} subLayersOnly
 * @param {Array} layersToExclude
 * @returns {Array}
 */
export function findLayersInLayer(name, exactMatch, type, rootLayer, subLayersOnly, layersToExclude) {

  //create predicate format
  var formatRules = ['(name != NULL)']
  var args = []

  //name
  if (name) {
    if (exactMatch) {
      formatRules.push('(name == %@)')
    }
    else {
      formatRules.push('(name like %@)')
    }
    args.push(name)
  }

  //type
  if (type) {
    formatRules.push('(className == %@)')
    args.push(type)
  }
  else {
    formatRules.push('(className == "MSLayerGroup" OR className == "MSShapeGroup" OR className == "MSArtboardGroup" OR className == "MSTextLayer")')
  }

  //layers to exclude
  if (layersToExclude) {
    formatRules.push('NOT (SELF IN %@)')
    args.push(layersToExclude)
  }

  //prepare format string
  var formatString = formatRules.join(' AND ')

  //create predicate
  var predicate = NSPredicate.predicateWithFormat_argumentArray(formatString, args)

  //get layers to filter
  var layers
  if (subLayersOnly) {
    layers = rootLayer.layers()
  } else {
    layers = rootLayer.children()
  }

  //perform query
  var queryResult = layers.filteredArrayUsingPredicate(predicate)

  //return result as js array
  return Utils.convertToJSArray(queryResult)
}


/**
 * Finds a single layer in the root layer.
 *
 * @param {string} name
 * @param {bool} exactMatch
 * @param {string} type
 * @param {MSLayer} rootLayer
 * @param {bool} subLayersOnly
 * @param {Array} layersToExclude
 * @returns {MSLayer}
 */
export function findLayerInLayer(name, exactMatch, type, rootLayer, subLayersOnly, layersToExclude) {
  var result = findLayersInLayer(name, exactMatch, type, rootLayer, subLayersOnly, layersToExclude)

  //return first layer in result
  if (result.length) return result[0]
}


/**
 * Finds a page with the specified name in the current document.
 *
 * @param {string} name
 * @param {bool} fullMatch
 * @returns {MSPage}
 */
export function findPageWithName(name, fullMatch) {

  var doc = MSDocument.currentDocument()
  var pages = jsArray(doc.pages())
  for (var i = 0; i < pages.length; i++) {
    var currentPage = pages[i]

    //if page matches name
    if (fullMatch) {
      if (currentPage.name() == name) {
        return currentPage
      }
    }
    else {
      if (currentPage.name().indexOf(name) > -1) {
        return currentPage
      }
    }
  }
}


/**
 * Refreshes text layer boundaries after setting text. This is used as Sketch
 * sometimes forgets to resize the text layer.
 *
 * @param layer
 */
export function refreshTextLayer(layer) {
  layer.adjustFrameToFit()
  layer.select_byExpandingSelection(true, false)
  layer.setIsEditingText(true)
  layer.setIsEditingText(false)
  layer.select_byExpandingSelection(false, false)
}


/**
 * Returns the currently selected layers as a Javascript array.
 *
 * @returns {Array}
 */
export function getSelectedLayers() {
  return Utils.convertToJSArray(Context().document.selectedLayers())
}


/**
 * Sets the current layer selection to the provided layers.
 *
 * @param {Array} layers
 */
export function selectLayers(layers) {

  //deselect current selection
  Context().document.deselectAllLayers()

  //select layers
  layers.forEach(function (layer) {
    layer.select_byExpandingSelection(true, false)
  })
}


/**
 * Adds a page with the specified name to the current document.
 *
 * @param {string} name
 * @returns {MSPage}
 */
export function addPage(name) {

  //get doc
  var doc = Context().document

  //get current page
  var currentPage = doc.currentPage()

  //create new page
  var page = doc.addBlankPage()
  page.setName(name)

  //make current page active again
  doc.setCurrentPage(currentPage)

  return page
}


/**
 * Removes the page with the specified name from the current document.
 *
 * @param {MSPage} page
 */
export function removePage(page) {

  //get doc
  var doc = Context().document

  //get current page
  var currentPage = doc.currentPage()

  //remove page
  doc.removePage(page)

  //make current page active again
  doc.setCurrentPage(currentPage)
}


/**
 * Checks if the layer is a symbol instance.
 *
 * @param {MSLayer} layer
 * @returns {bool}
 */
export function isSymbolInstance(layer) {
  return layer.isKindOfClass(MSSymbolInstance.class())
}


/**
 * Checks if the layer is a layer group.
 *
 * @param {MSLayer} layer
 * @returns {bool}
 */
export function isLayerGroup(layer) {
  return layer.isKindOfClass(MSLayerGroup.class()) && !layer.isKindOfClass(MSShapeGroup.class())
}


/**
 * Checks if the layer is a shape/shape group.
 *
 * @param {MSLayer} layer
 * @returns {bool}
 */
export function isLayerShapeGroup(layer) {
  return layer.isKindOfClass(MSShapeGroup.class())
}


/**
 * Checks if the layer is a text layer.
 *
 * @param {MSLayer} layer
 * @returns {bool}
 */
export function isLayerText(layer) {
  return layer.isKindOfClass(MSTextLayer.class())
}


/**
 * Checks if the layer is an artboard.
 *
 * @param {MSLayer} layer
 * @returns {bool}
 */
export function isArtboard(layer) {
  return layer.isKindOfClass(MSArtboardGroup.class())
}


/**
 * Creates a grid from layers.
 *
 * @param selectedLayers
 * @param opt
 * @returns {Array}
 */
export function createGrid(selectedLayers, opt) {

  //check rows count
  if (!opt.rowsCount || opt.rowsCount < 0) {
    Context().document.showMessage('Number of grid rows must be at least 1.')
    return
  }

  //check rows margin
  if (!opt.rowsMargin && opt.rowsMargin != 0) {
    Context().document.showMessage('Grid row margin is invalid.')
    return
  }

  //check column count
  if (!opt.columnsCount || opt.columnsCount < 0) {
    Context().document.showMessage('Number of grid columns must be at least 1.')
    return
  }

  //check columns margin
  if (!opt.columnsMargin && opt.columnsMargin != 0) {
    Context().document.showMessage('Grid column margin is invalid.')
    return
  }

  //get first layer (most top left)
  var layer = selectedLayers[0]
  var smallestX = selectedLayers[0].frame().x()
  var smallestY = selectedLayers[0].frame().y()
  for (var i = 0; i < selectedLayers.length; i++) {
    var tempLayer = selectedLayers[i]
    if (tempLayer.frame().x() < smallestX || tempLayer.frame().y() < smallestY) {
      smallestX = tempLayer.frame().x()
      smallestY = tempLayer.frame().y()
      layer = tempLayer
    }
  }

  //arrange copies of the first layer
  var layerWidth = layer.frame().width()
  var layerHeight = layer.frame().height()
  var layerParent = layer.parentGroup()
  if (!layerParent) layerParent = layer.parentArtboard()
  if (!layerParent) layerParent = layer.parentPage()

  //remove selected layers from parent
  selectedLayers.forEach(function (tempLayer) {
    tempLayer.removeFromParent()
  })

  //keep track of original position
  var startX = layer.frame().x()
  var startY = layer.frame().y()

  //store new selected layers
  var newSelectedLayers = []

  //create rows
  for (var i = 0; i < opt.rowsCount; i++) {

    //set row y
    var y = startY + (i * (layerHeight + opt.rowsMargin))

    //create columns
    for (var j = 0; j < opt.columnsCount; j++) {

      //create layer copy
      var copy = Utils.copyLayer(layer)

      //add to parent layer
      layerParent.addLayers([copy])

      //add to selected layers
      newSelectedLayers.push(copy)

      //set column x
      var x = startX + (j * (layerWidth + opt.columnsMargin))

      //position copy
      copy.frame().setX(x)
      copy.frame().setY(y)
    }
  }

  return newSelectedLayers
}