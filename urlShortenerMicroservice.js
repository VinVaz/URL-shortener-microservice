var http = require('http');
var port = process.env.PORT || 8080;

	http.createServer(function(req, res){
		var originalUrl = req.url.slice(1);
		
		//shortUrl must come from a database
		//the database will store original url with some
		//id number that can give to this program some 
		//type of code to generate the new url address
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
		res.write(JSON.stringify(req.url));
		res.end();
	  
	}).listen(port);