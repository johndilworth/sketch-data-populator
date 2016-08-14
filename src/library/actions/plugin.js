/**
 * Plugin action
 */


import * as Utils from '../utils'
import * as Layers from '../layers'


export const name = 'plugin'
export const alias = 'p'


/**
 * Runs the specified plugin command.
 *
 * @param {boolean} condition
 * @param {MSLayer} layer
 * @param {Array} params
 */
export function perform(condition, layer, params) {

  //only run if the condition is true
  if(!condition) return

  //get plugin manager
  let pluginManager = NSApp.delegate().pluginManager()

  //get all plugin bundles
  let pluginBundles = pluginManager.plugins()

  //build plugin tree
  let plugins = {}
  Utils.convertToJSArray(pluginBundles.allKeys()).forEach((bundleIdentifier) => {

    //get bundle
    let bundle = pluginBundles.objectForKey(bundleIdentifier)

    //get plugin commands
    let pluginCommands = bundle.commands()

    //build command object
    let commands = {}
    Utils.convertToJSArray(pluginCommands.allKeys()).forEach((commandIdentifier) => {

      //get command
      let command = pluginCommands.objectForKey(commandIdentifier)

      //add command
      commands[command.name()] = command
    })

    //add plugin with commands
    plugins[bundle.name()] = commands
  })

  //get plugin command path
  let commandPath = params[0].split('>').map((component) => {
    return component.trim()
  })

  //get command to perform
  let command = plugins[commandPath[0]][commandPath[1]]

  //store current layer selection
  let originalSelection = Layers.getSelectedLayers()

  //select only the passed layer
  Layers.selectLayers([layer])

  //run the command
  NSApp.delegate().runPluginCommand(command)

  //restore original selection
  Layers.selectLayers(originalSelection)
}