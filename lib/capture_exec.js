var exec = require('child_process').exec
var os = require('os')
var fs = require('fs')
var path = require('path')
var util = require('util')

// freeware nircmd http://www.nirsoft.net/utils/nircmd.html
var nircmdc = os.arch() === 'x64'
  ? path.resolve(__dirname, '../bin/nircmdc-x64.exe')
  : path.resolve(__dirname, '../bin/nircmdc.exe')

function captureCommand (path) {
  if (process.env.CAPTURE_COMMAND) {
    return util.format(process.env.CAPTURE_COMMAND, path)
  } else {
    switch (os.platform()) {
      case 'win32':
        return '"' + nircmdc + '" savescreenshot ' + path
      case 'freebsd':
        return 'scrot -s ' + path
      case 'darwin':
        return 'screencapture -i ' + path
      case 'linux':
        return 'import ' + path
      default:
        throw new Error('unsupported platform')
    }
  }
}

exports.capture = function (filePath, callback) {
  exec(captureCommand(filePath), function (err) {
    // nircmd always exits with err even though it works
    if (err && os.platform() !== 'win32') callback(err)

    fs.exists(filePath, function (exists) {
      // check exists for success/fail instead
      if (!exists) {
        return callback(new Error('Screenshot failed'))
      }
      callback(null, filePath)
    })
  })
}
