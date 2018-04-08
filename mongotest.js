var http = require('http');
MongoClient = require("mongodb").MongoClient;


var dbUrl = 'mongodb://localhost:27017';
dbName = "learnyoumongo"; 
var collection = null;

var url = "www.google.com"
var pass = "fcc55"

MongoClient.connect(dbUrl, function(err, client){
	
	if(err) console.log("failed to connect with database");
	const db = client.db("test")
	const collection = db.collection("kindofurls");
	
	//find the original url address through the password:
	function getUrlFromPassword(pass, callback){
		collection.find({password: pass}).toArray(function(err, doc){ 
				if(err) callback(err);
				if(doc.length !=0) var url = doc[0]["original"];
				else var url = "not found";
			    callback(null, url);
		});
	}
		getUrlFromPassword(pass, function(err, url){
	
				  if(err) throw err;
		         console.log(url)
		         client.close()
			
		    
	    })
 
});




