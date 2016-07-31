/**
 * Gui library
 *
 * Provides functionality create various user interface components.
 */


import Context from '../context'


/**
 * Creates a new alert with a title, message and icon.
 *
 * @param {string} title
 * @param {string} message
 * @param {string} iconFileName
 * @returns {COSAlertWindow}
 */
export function createAlert(title, message, iconFileName) {

  var alert = COSAlertWindow.new()
  alert.setMessageText(title)
  alert.setInformativeText(message)

  if (iconFileName) {

    //get icon path
    var scriptPath = NSString.stringWithString(Context().scriptPath)
    scriptPath = scriptPath.stringByDeletingLastPathComponent()
    var iconPath = scriptPath.stringByAppendingPathComponent(iconFileName)

    //set icon
    var icon = NSImage.alloc().initByReferencingFile(iconPath)
    alert.setIcon(icon)
  }

  return alert
}


/**
 * Creates a set of views that comprise the data options view show in the alert.
 *
 * @param {Object} opt
 * @returns {Object}
 */
export function createDataOptionsView(opt) {
  opt = opt || {}

  //create options view
  var optionsView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 110))

  //create options view title
  var optionsViewTitle = createLabel('Data options', 12, true, NSMakeRect(0, 90, 300, 20))
  optionsView.addSubview(optionsViewTitle)

  //create randomize checkbox
  var randomizeCheckbox = createCheckbox('Randomize data order', false, NSMakeRect(0, 65, 300, 20))
  optionsView.addSubview(randomizeCheckbox)
  if (opt.noRandomize) {

    //set randomize checkbox state
    randomizeCheckbox.setState(false)
    randomizeCheckbox.setEnabled(false)
  }

  //create trim checkbox
  var trimCheckbox = createCheckbox('Trim overflowing text (fixed width text layers)', false, NSMakeRect(0, 45, 300, 20))
  optionsView.addSubview(trimCheckbox)

  //set trim checkbox state
  trimCheckbox.setState(NSUserDefaults.standardUserDefaults().objectForKey('trimText'))

  //create ellipsis checkbox
  var ellipsisCheckbox = createCheckbox('Insert ellipsis after trimmed text', false, NSMakeRect(0, 25, 300, 20))
  optionsView.addSubview(ellipsisCheckbox)

  //set ellipsis checkbox state
  ellipsisCheckbox.setState(NSUserDefaults.standardUserDefaults().objectForKey('insertEllipsis'))

  //create substitute label
  var substituteLabel = createLabel('Default substitute:', 12, false, NSMakeRect(0, 0, 110, 20))
  optionsView.addSubview(substituteLabel)

  //create substitute text field
  var substituteTextField = NSTextField.alloc().initWithFrame(NSMakeRect(110, 0, 120, 22))
  optionsView.addSubview(substituteTextField)

  //set substitute
  if (NSUserDefaults.standardUserDefaults().objectForKey('defaultSubstitute')) {
    substituteTextField.setStringValue(NSUserDefaults.standardUserDefaults().objectForKey('defaultSubstitute'))
  }
  else {
    substituteTextField.setStringValue('')
  }

  //return configured view
  return {
    view: optionsView,
    randomizeCheckbox: randomizeCheckbox,
    trimCheckbox: trimCheckbox,
    ellipsisCheckbox: ellipsisCheckbox,
    substituteTextField: substituteTextField
  };
}


/**
 * Creates a set of views that comprise the layout options view show in the alert.
 *
 * @returns {Object}
 */
export function createLayoutOptionsView() {

  //create options view
  var optionsView = NSView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 104))

  //create options view title
  var optionsViewTitle = createLabel('Layout options', 12, true, NSMakeRect(0, 84, 300, 20))
  optionsView.addSubview(optionsViewTitle)

  //create create grid checkbox
  var createGridCheckbox = createCheckbox('Create grid', false, NSMakeRect(0, 59, 300, 20))
  optionsView.addSubview(createGridCheckbox)

  //set randomize checkbox state
  createGridCheckbox.setState(NSUserDefaults.standardUserDefaults().objectForKey('createGrid'))


  //create rows count label
  var rowsCountLabel = createLabel('Rows:', 12, false, NSMakeRect(0, 27, 60, 20))
  optionsView.addSubview(rowsCountLabel)

  //create rows count text field
  var rowsCountTextField = NSTextField.alloc().initWithFrame(NSMakeRect(60, 27, 70, 22))
  optionsView.addSubview(rowsCountTextField)

  //set rows count
  if (NSUserDefaults.standardUserDefaults().objectForKey('rowsCount')) {
    rowsCountTextField.setStringValue(NSUserDefaults.standardUserDefaults().objectForKey('rowsCount'))
  }
  else {
    rowsCountTextField.setStringValue('1')
  }

  //create rows margin label
  var rowsMarginLabel = createLabel('Margin:', 12, false, NSMakeRect(142, 27, 50, 20))
  optionsView.addSubview(rowsMarginLabel)

  //create rows margin text field
  var rowsMarginTextField = NSTextField.alloc().initWithFrame(NSMakeRect(190, 27, 70, 22))
  optionsView.addSubview(rowsMarginTextField)

  //set rows margin
  if (NSUserDefaults.standardUserDefaults().objectForKey('rowsMargin')) {
    rowsMarginTextField.setStringValue(NSUserDefaults.standardUserDefaults().objectForKey('rowsMargin'))
  }
  else {
    rowsMarginTextField.setStringValue('10')
  }

  //create columns count label
  var columnsCountLabel = createLabel('Columns:', 12, false, NSMakeRect(0, 0, 60, 20))
  optionsView.addSubview(columnsCountLabel)

  //create columns count text field
  var columnsCountTextField = NSTextField.alloc().initWithFrame(NSMakeRect(60, 0, 70, 22))
  optionsView.addSubview(columnsCountTextField)

  //set columns count
  if (NSUserDefaults.standardUserDefaults().objectForKey('columnsCount')) {
    columnsCountTextField.setStringValue(NSUserDefaults.standardUserDefaults().objectForKey('columnsCount'))
  }
  else {
    columnsCountTextField.setStringValue('1')
  }

  //create columns margin label
  var columnsMarginLabel = createLabel('Margin:', 12, false, NSMakeRect(142, 0, 50, 20))
  optionsView.addSubview(columnsMarginLabel)

  //create columns margin text field
  var columnsMarginTextField = NSTextField.alloc().initWithFrame(NSMakeRect(190, 0, 70, 22))
  optionsView.addSubview(columnsMarginTextField)

  //set columns margin
  if (NSUserDefaults.standardUserDefaults().objectForKey('columnsMargin')) {
    columnsMarginTextField.setStringValue(NSUserDefaults.standardUserDefaults().objectForKey('columnsMargin'))
  }
  else {
    columnsMarginTextField.setStringValue('10')
  }

  //return configured view
  return {
    view: optionsView,
    createGridCheckbox: createGridCheckbox,
    rowsCountTextField: rowsCountTextField,
    rowsMarginTextField: rowsMarginTextField,
    columnsCountTextField: columnsCountTextField,
    columnsMarginTextField: columnsMarginTextField
  }
}