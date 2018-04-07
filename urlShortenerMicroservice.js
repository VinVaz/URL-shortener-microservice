var http = require('http');
var port = process.env.PORT || 8080;

	http.createServer(function(req, res){
		
		const originalUrl = req.url.slice(1);
		//password comes from the database and it is stored there along with 
		//the original url address when the last is stored  for first time
		var password = "0950395";
		var myHost = req.headers.host;
		const shortUrl = `http://${myHost}/${password}`;

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