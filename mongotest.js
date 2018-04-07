var http = require('http');
MongoClient = require("mongodb").MongoClient;


var dbUrl = 'mongodb://localhost:27017';
dbName = "learnyoumongo"; 
var collection = null;

MongoClient.connect(dbUrl, function(err, client){
	if(err) console.log("failed to connect with database");
	
	const db = client.db(dbName); 
	var collection = db.collection("kindofurls");
	
	//insert original url addresses:
    collection.updateOne({original: "www.google.com"}, {$set: {original: "www.google.com"}}, {upsert: true}, function(err, data){
		if(err) console.log("failed to insert document");
	});
    var password = "07f913";
	//find password:
	collection.find({original: "www.google.com"}, {projection: {original: 0}}).toArray(function(err, doc){
		if(err) console.log("Failed to find the url");
		console.log(doc[0]["_id"]);
		client.close();
	});

	//update with the password key:
	collection.updateOne({"original": "www.google.com"}, {"$set": {"password":password}}, function(err, data){
		if(err) console.log("Failed to update")
	});
    //find the password through the original url address:
    collection.find({original: "www.google.com"}, {projection: {password: 1, _id: 0}}).toArray(function(err, doc){
		if(err) console.log("Failed to find the url");
		console.log(doc[0]["password"]);
		client.close();
	});
});







