const http = require('http');
const handleStaticFileRequest = require('./controllers/handleStaticFileRequest');
const { openShortenedUrl, sendShortenedUrl } = require('./controllers/database/handleDatabase');
const { validStaticExtention, getRequestType } = require('./controllers/handleRequests');
const port = process.env.PORT || 8080;

http.createServer((req, res) => {
  
  let reqPath = (req.url=='/') ? '/frontPage.html' : req.url;
  reqPath = reqPath.slice(1)
  
  switch (getRequestType(reqPath)) {
    case "STACTIC_FILE_REQUEST":
      handleStaticFileRequest(reqPath, res);
      break;
    
    case "ORIGINAL_URL":
      sendShortenedUrl(reqPath, req, res);
      break;
    
    case "SHORTENED_URL":
      openShortenedUrl(reqPath, req, res);
      break;
      
    default:
      let errorMessage = {
        ERROR: 'Invalid URL address'
      }
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write(JSON.stringify(errorMessage));
      res.end();
  }
  
}).listen(port);
