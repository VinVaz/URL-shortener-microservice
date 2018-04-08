var http = require('http');
var MongoClient = require("mongodb").MongoClient;
var port = process.env.PORT || 8080;


const dbUrl = 'mongodb://localhost:27017';
const dbName = "test"
var collection = null;

//*********************************************************************
http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type': 'text/plain'});
	
	const myPath = req.url.slice(1);
	const myHost = req.headers.host;
		
	var myMessage = {};
	var isPasswordStored = false;
	
	
	//checks if the request is an original url or 
	//a path of some short url
	var urlValidation = /^http:[/][/]www[.][a-z]+[.]com/i;
	var passwordValidation = /^\d+$/;
	var isUrlValid = urlValidation.test(myPath);
	var isPasswordValid = passwordValidation.test(myPath);

	if(isPasswordValid){
     //*********************************************************************
		var pass = myPath;
		//Opens mongo connection:
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
		//End of mongo connection
     //*********************************************************************		
	}
	else{
		if(isUrlValid){
			//*********************************************************************
			//*********************************************************************			
			var originalUrl = myPath; 
			
			//Opens mongo connection:
			MongoClient.connect(dbUrl, function(err, client){

				if(err) console.log("failed to connect with database");
				const db = client.db("test")
				const collection = db.collection("kindofurls");
				function respond(callback){	
					addUrlSavePassword(originalUrl, function(err, data){
						if(err) console.log("err")
						collection.find({original: originalUrl}).toArray(function(err, data){
						   if(err) callback(err);
						  
							var password = data[0]["password"];
							const shortUrl = `http://${myHost}/${password}`;
							myMessage = {
								original_url: originalUrl,
								short_url:	shortUrl	
							}  
							callback(null, myMessage);
							client.close();
						});
					});
				}
				respond(function(err, data){
					if(err) console.log("Failed to find message");
					res.write(JSON.stringify(data));
					res.end();
				});		
				//*********************************************************************			
				//**********************************************************************	
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
				//**********************************************************************	
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
				//*********************************************************************		
			});
			//End of mongo connection						
	    }
		else{
			myMessage = {
				ERROR: "Invalid URL address"
			}
		res.write(JSON.stringify(myMessage));
		res.end();
		}
	}
}).listen(port);
//*********************************************************************










