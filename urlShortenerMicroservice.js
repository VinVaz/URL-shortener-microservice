var http = require('http');
MongoClient = require("mongodb").MongoClient;
var port = process.env.PORT || 8080;

http.createServer(function(req, res){
	
	const myPath = req.url.slice(1);
	const myHost = req.headers.host;
	
	var myMessage = {};
	var isOriginalUrlStored = false;
	var isPasswordStored = false;
	
	//checks if the request is an original url or 
	//a path of some short url
	var urlValidation = /http:[/][/]www[.][a-z]+[.]com/i;
	var passwordValidation = /\d+/;
	var isUrlValid = urlValidation.test(myPath);
	var isPasswordValid = passwordValidation.test(myPath);
	
	if(isPasswordValid){
		if(isPasswordStored){
			//open the correspondent address
			//instead of retriving the response
		}
		else{
			myMessage = {
				ERROR: "Invalid short URL address"
			}
		}
	}
	else{
		if(isUrlValid){
			if(!isOriginalUrlStored){
				//stores the original url on the database
				//gets the id of that location on the database
				//stores a password based on the id's value
			}
			
			//recover the password
			//example of password:
			var password = "0950395";
			const shortUrl = `http://${myHost}/${password}`;
			
			myMessage = {
				original_url: myPath,
				short_url:	shortUrl	
			}
		}
		else{
			myMessage = {
				ERROR: "Invalid URL address"
			}
		}	
	}
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write(JSON.stringify(myMessage));
	res.end();
  
}).listen(port);


var databaseUrl = 'mongodb://localhost:27017/'; 
var collection = null;

MongoClient.connect(databaseUrl, function(err, db){
	if(err) throw err;

	var collection = db.collection("kindofurls");
});







