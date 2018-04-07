var http = require('http');
var port = process.env.PORT || 8080;

	http.createServer(function(req, res){
		var originalUrl = req.url.slice(1);
		//shortUrl must come from a database
		var shortUrl = "";
		
		//a validation must be created to accept only real url
		var isUrlValid = true;
		var myMessage = {};
		if(isUrlValid){
			myMessage = {
				original_url: originalUrl,
				short_url:	shortUrl	
			}
		}
		else{
			myMessage = {
				ERROR: "Invalid URL"
			}
		}
	  
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.write(JSON.stringify(myMessage));
		res.end();
	  
	}).listen(port);