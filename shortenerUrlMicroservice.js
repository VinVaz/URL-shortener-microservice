const http = require('http');
const MongoClient = require("mongodb").MongoClient;
const fs = require('fs');
const path = require('path');
var port = process.env.PORT || 8080;
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;

const dbUrl = 'mongodb://'+dbuser+':'+dbpassword+'@ds014388.mlab.com:14388/myprotodata';
const dbName = "myprotodata"
var collection = null;


http.createServer(function(req, res){
  
  var reqPath = (req.url=="/")? "/frontPage.html" : req.url;
  var ext = path.extname(reqPath);
  var validExtensions = {
        ".html" : "text/html",          
        ".js": "application/javascript", 
        ".css": "text/css",
        ".txt": "text/plain",
        ".jpg": "image/jpeg",
        ".gif": "image/gif",
        ".png": "image/png",
        ".ico": "image/png"
  };
  var isValidExt = validExtensions[ext];
  const myHost = req.headers.host;
	
  var myMessage = {};
  var isPasswordStored = false;
  
  //serves the static page with an access to css for example
  if(isValidExt){
	  fileName = path.join(process.cwd(), reqPath);
	  fs.open(fileName, 'r', function(err, fd){
		  if(!err){
	        fs.readFile(fd, "binary", function(err, file){
		      if(err) console.log("Error to read file")  
	          res.setHeader('Content-Type', validExtensions[ext]);
              res.statusCode = 200;	
	          res.write(file, "binary");
              res.end();		
	        });  
		  }
	  })
  }
  //checks if the request is an original url or 
  //a path of some short url
  var urlValidation = /^http[s]?:[/][/](?:www[.])?[a-z]+[.]com/i;
  var passwordValidation = /^[a-z0-9]+$/;
  var isUrlValid = urlValidation.test(reqPath.slice(1));
  var isPasswordValid = passwordValidation.test(reqPath.slice(1));

  if(isPasswordValid){
    var pass = reqPath.slice(1);
    //Opens mongo connection:
    MongoClient.connect(dbUrl, function(err, client){
  
      if(err) console.log("Failed to connect with database");
      const db = client.db(dbName)
      const collection = db.collection("kindofurls");

      //find the original url address through the password:
      function respond(callback){
        collection.find({password: pass}).toArray(function(err, doc){
          if(err) callback(err);
          if(doc.length!=0){
            var url = doc[0]["original"];
            var html = `<script>window.open("${url}","_self")</script>`
			callback(null, null, html);
          } 
          else{
            myMessage = {
	          ERROR: "Short URL address not in the database"
            };
			callback(null, myMessage);
          }
        client.close();
        });
      }
      //wrap a function to response to work asynchronously
      respond(function(err, data, html){
        if(err) console.log("Failed to find url address");
		if(html){
			res.writeHead(200, {'Content-Type': 'text/html'});
		    res.write(html);
		}
        else if(data){
			res.writeHead(200, {'Content-Type': 'text/plain'});
		    res.write(JSON.stringify(data));
		}
        res.end();
      });
    });
	//End of mongo connection	
  }
  else{
    if(isUrlValid){
      //*********************************************************************		
      var originalUrl = reqPath.slice(1); 
			
      //Opens mongo connection:
      MongoClient.connect(dbUrl, function(err, client){

        if(err) console.log("Failed to connect with database");
        const db = client.db(dbName)
        const collection = db.collection("kindofurls");
		
        function respond(callback){	
          addUrlSavePassword(originalUrl, function(err, data){
            if(err) callback(err);
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
          res.writeHead(200, {'Content-Type': 'text/plain'});
		  res.write(JSON.stringify(data));
          res.end();
        });		
        //*********************************************************************				
        function addUrlSavePassword(url, callback){
          addUrlOnceToDB(url, function(err, data){ 
            if(err) callback(err);
          });
          getIdFromUrl(url, function(err, id){
            if(err) callback(err);
			//the short url address path will consist of the last 5 digits of the 
			//id provided by the database for a specific web address			
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
	//End of mongo connection						
    }
    else if(!isValidExt){
      myMessage = {
        ERROR: "Invalid URL address"
      }	
    res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write(JSON.stringify(myMessage));
    res.end();
    }
  }
}).listen(port);











