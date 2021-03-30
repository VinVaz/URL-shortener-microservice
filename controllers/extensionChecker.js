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

module.exports = extensionChecker;