const http = require('http');
const path = require('path');
let port = process.env.PORT || 8080;
const extensionChecker = require('./controllers/extensionChecker');
const handleStaticFileRequest = require('./controllers/handleStaticFileRequest');
const { openURL, sendShortenedUrl } = require('./controllers/mongoHandler')


http.createServer(function(req, res){
  
  let reqPath = (req.url=='/') ? '/frontPage.html' : req.url;
  let ext = path.extname(reqPath);
  let validExtension = extensionChecker(ext)
  
  handleStaticFileRequest(req, res);
  
  //checks if the request is an original url or 
  //a path of some shortened url
  let urlValidation = /^http([s]?):[/][/](?:www[.])?([a-z0-9]+)[.]com((?:[.][a-z][a-z])?)/i;
  let shortenedUrlValidation = /^[a-z0-9]+$/;
  let urlValid = urlValidation.test(reqPath.slice(1));
  let shortenedUrlValid = shortenedUrlValidation.test(reqPath.slice(1));

  if (shortenedUrlValid) {
    openURL(reqPath.slice(1), req, res)
  }
  else {
    if (urlValid) {
      sendShortenedUrl(reqPath.slice(1), req, res)
    }
    else if (!validExtension) {
      let errorMessage = {
        ERROR: 'Invalid URL address'
      }	
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write(JSON.stringify(errorMessage));
      res.end();
    }
  }
  
}).listen(port);
