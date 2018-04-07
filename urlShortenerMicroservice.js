var http = require('http');
var port = process.env.PORT || 8080;

	http.createServer(function(req, res){
		var originalUrl = req.url.slice(1);
		
		//shortUrl must come from a database
		var shortUrl = "";
		
		//validates the original url and creates a message with the response
		var validation = /http:[/][/]www[.][a-z]+[.]com/i;
		var isUrlValid = validation.test(originalUrl);
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