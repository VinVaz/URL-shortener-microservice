var http = require('http');
MongoClient = require("mongodb").MongoClient;


var dbUrl = 'mongodb://localhost:27017';
dbName = "learnyoumongo"; 
var collection = null;
var pass = "fcc55";
var myMessage = {};
MongoClient.connect(dbUrl, function(err, client){
		    
			if(err) console.log("failed to connect with database");
		    const db = client.db("test")
		    const collection = db.collection("kindofurls");
		
     		//find the original url address through the password:
			collection.find({password: pass}, {projection: {original: 1, _id: 0}}).toArray(function(err, doc){
					if(err) console.log("Failed to find url address");
					if(doc.length!=0){
						var url = doc[0]["original"];
						myMessage = {
						    _url: url
						}
					} 
					else{
						myMessage = {
						    ERROR: "Invalid short URL address"
						}
					}
		            console.log(myMessage);
					client.close();
			});
});




