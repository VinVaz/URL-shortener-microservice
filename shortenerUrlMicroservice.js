const http = require('http');
const handleStaticFileRequest = require('./controllers/handleStaticFileRequest');
const { openShortenedUrl, sendShortenedUrl } = require('./controllers/mongoHandler');
const { validStaticExtention,
        original_URL_Validation,
        shortened_URL_Validation } = require('./controllers/handleRequests');
const port = process.env.PORT || 8080;

http.createServer((req, res) => {
  
  let reqPath = (req.url=='/') ? '/frontPage.html' : req.url;
  
  // if the request is a static file the script serve the file
  handleStaticFileRequest(reqPath, res);
  
  // if the original url of a website is requested, send the shortened version
  if (original_URL_Validation(reqPath)) {
    sendShortenedUrl(reqPath.slice(1), req, res);
  }
  else {
    // if the shortened version of a url is requested, open the website
    if (shortened_URL_Validation(reqPath)) {
      openShortenedUrl(reqPath.slice(1), req, res)
    }
    else {
      // if none of the above, send error message
      if (!validStaticExtention(reqPath)) {
        let errorMessage = {
          ERROR: 'Invalid URL address'
        }	
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(JSON.stringify(errorMessage));
        res.end();
      }
    }
  }
}).listen(port);

