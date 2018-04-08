var http = require('http');
MongoClient = require("mongodb").MongoClient;


var dbUrl = 'mongodb://localhost:27017';
dbName = "learnyoumongo"; 
var collection = null;
//var pass = "fcc55";
var myMessage = {};

MongoClient.connect(dbUrl, function(err, client){
		    
	if(err) console.log("failed to connect with database");
	const db = client.db("test")
	const collection = db.collection("kindofurls");
	var url = "www.google.com";
	
	
    addUrlSavePassword(url, function(err, data){
		if(err) console.log("err1")
			collection.find({original: url}).toArray(function(err, doc){
			   if(err) console.log("err2");
			   var pass = doc[0]["password"];
			   console.log(pass);
		});
	});
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
                    client.close();					
		        });
		    });
	}
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
		collection.updateOne({original: url}, {$set: {password: pass}}, {upsert: true}, function(err, data){
			if(err) callback(err);
			callback(null, data);
		});
	}
	
	
	
});




