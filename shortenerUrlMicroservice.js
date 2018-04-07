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

var dbUrl = 'mongodb://localhost:27017';
var dbName = "test"
var collection = null;

MongoClient.connect(dbUrl, function(err, client){
	
	if(err) console.log("failed to connect with database");
	const db = client.db("test")
	const collection = db.collection("kindofurls");
	var password = "93842";
	
	//insert original url address, only if it is not already on the database:
    collection.updateOne({original: "www.google.com"}, {$set: {original: "www.google.com"}}, {upsert: true}, function(err, data){
		if(err) console.log("failed to insert document");
	});

	//find the _id of the original and create password of it:
	collection.find({original: "www.google.com"}, {projection: {original: 0}}).toArray(function(err, doc){
		if(err) console.log("Failed to find the url");
		console.log(doc[0]["_id"]);
		var password = doc[0]["_id"];
	});
	//update with the password key:
	collection.updateOne({original: "www.google.com"}, {$set: {password: password}}, function(err, data){
		if(err) console.log("Failed to update")
	});
	//find the original url address through the password:
    collection.find({password: "07f913"}, {projection: {original: 1, _id: 0}}).toArray(function(err, doc){
		if(err) console.log("Failed to find the url");
		console.log(doc[0]["original"]);
		client.close();
	});
	//find the password through the original url address:
    collection.find({original: "www.google.com"}, {projection: {password: 1, _id: 0}}).toArray(function(err, doc){
		if(err) console.log("Failed to find the url");
		console.log(doc[0]["password"]);
		client.close();
	});
		
	client.close();
});







