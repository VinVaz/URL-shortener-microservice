const fs = require('fs');
const path = require('path');
const extensionChecker = require('./extensionChecker');


const handleStaticFileRequest = (req, res) => {
  let reqPath = (req.url=='/') ? '/frontPage.html' : req.url;
  let ext = path.extname(reqPath);
  let validExtension = extensionChecker(ext);
  
  if (validExtension) {
	  validPath = path.join(process.cwd(), reqPath);
	  fs.open(validPath, 'r', (err, fd) => {
		  if (!err) {
        fs.readFile(fd, 'binary', (err, file) => {
          if (err) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Failed to load requested page');  
          }
          res.setHeader('Content-Type', validExtension);
          res.statusCode = 200;	
          res.write(file, 'binary');
          res.end();
        })
      }
	  })
  }
}

module.exports = handleStaticFileRequest;