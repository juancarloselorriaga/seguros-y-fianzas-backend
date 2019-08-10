const path       = require('path');

exports.get404 = (req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '../public/404.html'))
}

exports.get500 = (err, req, res, next) => {
  console.error(err.stack)
  res.sendFile(path.join(__dirname, '../public/500.html'))
}