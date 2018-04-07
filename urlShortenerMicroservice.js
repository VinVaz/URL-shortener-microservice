var http = require('http');
var port = process.env.PORT || 8080;

  http.createServer(function(req, res){
	  var originalUrl = req.url.slice(1);
	  //shortUrl must come from a database
	  var shortUrl = "";
	  //a validation must be created to accept only real url
	  var myMessage = {
		original_url: originalUrl,
        short_url:	shortUrl	
	  }
	  res.writeHead(200, {'Content-Type': 'text/plain'});
	  res.write(JSON.stringify(originalUrl));
	  res.end();
	  
  }).listen(port);