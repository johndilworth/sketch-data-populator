/**
 * Utils library
 *
 * Provides utility and miscellaneous functionality.
 */


/**
 * Converts the native Objective-C array to a Javascript Array.
 *
 * @param {NSArray} nativeArray
 * @returns {Array}
 */
export function convertToJSArray(nativeArray) {
  var length = nativeArray.count();
  var jsArray = [];

  while (length--) {
    jsArray.push(nativeArray.objectAtIndex(length));
  }
  return jsArray;
}


/**
 * Creates a copy of the provided layer.
 *
 * @param {MSLayer} layer
 * @returns {MSLayer}
 */
export function copyLayer(layer) {

  //create duplicate
  var layerCopy = layer.duplicate();

  //remove duplicate from parent
  layerCopy.removeFromParent();

  return layerCopy;
}


/**
 * Generates a random integer between min and max inclusive.
 *
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
export function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


/**
 * Substitutes the placeholders in the string using the provided values.
 *
 * @param {string} string - String with placeholders in the {placeholder} format.
 * @param {Object} values - Object with values to substitute for placeholders.
 * @returns {string} - String with placeholders substituted for values.
 */
export function mergeStringWithValues(string, values) {

  //get properties in values
  var properties = Object.keys(values);

  properties.forEach(function (property) {

    //escape regex
    var sanitisedProperty = property.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    sanitisedProperty = '{' + sanitisedProperty + '}';

    //build regex
    var exp = RegExp(sanitisedProperty, 'g');

    //replace instances of property placeholder with value
    string = string.replace(exp, values[property]);
  });

  return string;
}