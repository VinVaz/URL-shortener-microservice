const path = require('path');

const extensionChecker = (extension) => {
  const validExtensions = {
        '.html' : 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.txt': 'text/plain',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.png': 'image/png',
        '.ico': 'image/png',
  };
  return validExtensions[extension];
}

const validStaticExtention = (reqPath) => {
  let ext = path.extname(reqPath);
  return extensionChecker(ext);
}

const original_URL_Validation = (reqPath) => {
  let urlValidation = /^http([s]?):[/]{2}(?:www[.])?([a-z0-9]+)[.]com((?:[.][a-z][a-z])?)/i;
  let is_URL_Valid = urlValidation.test(reqPath.slice(1));
  return is_URL_Valid;
}

const shortened_URL_Validation = (reqPath) => {
  let shortenedUrlValidation = /^[a-z0-9]+$/;
  let is_Shortened_URL_Valid = shortenedUrlValidation.test(reqPath.slice(1));
  return is_Shortened_URL_Valid;
}


module.exports = { validStaticExtention, original_URL_Validation, shortened_URL_Validation };