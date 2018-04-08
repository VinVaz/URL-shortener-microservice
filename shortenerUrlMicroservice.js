var http = require('http');
var MongoClient = require("mongodb").MongoClient;
var port = process.env.PORT || 8080;


const dbUrl = 'mongodb://localhost:27017';
const dbName = "test"
var collection = null;

//*********************************************************************
http.createServer(function(req, res){
	
	const myPath = req.url.slice(1);
	const myHost = req.headers.host;
		
	var myMessage = {};
	var isPasswordStored = false;
	res.writeHead(200, {'Content-Type': 'text/plain'});
	
	//checks if the request is an original url or 
	//a path of some short url
	var urlValidation = /http:[/][/]www[.][a-z]+[.]com/i;
	var passwordValidation = /\d+/;
	var isUrlValid = urlValidation.test(myPath);
	var isPasswordValid = passwordValidation.test(myPath);

	if(isPasswordValid){
//*********************************************************************
		var pass = myPath;
		//Connect with mongo to search for a web address
		MongoClient.connect(dbUrl, function(err, client){
		  
			if(err) console.log("failed to connect with database");
		    const db = client.db("test")
		    const collection = db.collection("kindofurls");
			
     		//find the original url address through the password:
			function respond(callback){
			    collection.find({password: pass}).toArray(function(err, doc){
       				if(err) callback(err);
					if(doc.length!=0){
						var url = doc[0]["original"];
						myMessage = {
						    open: url
						}
					} 
					else{
						myMessage = {
						    ERROR: "Invalid short URL address"
						}
					}
				callback(null, myMessage);
			    client.close();
			    });
			}
			//wrap a function to response to work asynchronously
			respond(function(err, data){
				if(err) console.log("Failed to find url address");
		        res.write(JSON.stringify(data));
	            res.end();
	        });
		});
//*********************************************************************
	}
	else{
		if(isUrlValid){

			//stores the original url on the database
			//gets the id of that location on the database
			//stores a password based on the id's value
			
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
  
}).listen(port);
//*********************************************************************


/*	
var url = "www.google.com"
	
//connect with a database
MongoClient.connect(dbUrl, function(err, client){

	
	if(err) console.log("failed to connect with database");
	const db = client.db("test")
	const collection = db.collection("kindofurls");
	
	//insert original url address, only if it is not already on the database:
	function addUrlOnceToDB(url, callback){
		collection.updateOne({original: url}, {$set: {original: url}}, {upsert: true}, function(err, data){
			if(err) callback(err);
			callback(null, data);
	    });
	}
	//find the _id of an url address:
	function getIdFromUrl(url, callback){
		collection.find({original: url}, {projection: {_id: 1}}).toArray(function(err, doc){
			if(err) callback(err);
			var id = doc[0]["_id"];
			callback(null, id);
		});
	}
	//puts a password key into a document
	function savePasswordOnDB(url, pass, callback){
		collection.updateOne({original: url}, {$set: {password: pass}}, function(err, data){
			if(err) callback(err);
			callback(null, data);
		});
	}
	function addUrlSavePassword(url, callback){

		addUrlOnceToDB(url, function(err, data){ 
		    if(err) callback(err);

		});
		getIdFromUrl(url, function(err, id){
			if(err) callback(err);
		    var password = id.toString().slice(-5);
			
			    savePasswordOnDB(url, password, function(err, data){
			        if(err) callback(err);
                    callback(err, data);					
		        });
		    });
	}
	addUrlSavePassword(url, function(err, data){
	});
	//find the original url address through the password:
	function getUrlFromPassword(pass, callback){
		collection.find({password: pass}, {projection: {original: 1, _id: 0}}).toArray(function(err, doc){
			if(err) callback(err);
			var url = doc[0]["original"];
			callback(null, url)
		});
	}
	//find the password through the original url address:
	function getPasswordFromUrl(url, callback){
		collection.find({original: url}, {projection: {password: 1, _id: 0}}).toArray(function(err, doc){
			if(err) callback(err);
			var url = doc[0]["password"]
			callback(null, url)
		});
	}
		
	client.close();
});


*/




