const http = require('http');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const path = require('path');
let port = process.env.PORT || 8080;
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;


const dbUrl = 'mongodb://'+dbuser+':'+dbpassword+'@ds014388.mlab.com:14388/myprotodata';
const dbName = 'myprotodata';
let collection = null;

http.createServer(function(req, res){
  let reqPath = (req.url=='/') ? '/frontPage.html' : req.url;
  let ext = path.extname(reqPath);
  let validExtension = getValidExtension(ext)
  
  handleStaticFileRequest(req, res);
  
  //checks if the request is an original url or 
  //a path of some shortened url
  let urlValidation = /^http([s]?):[/][/](?:www[.])?([a-z0-9]+)[.]com((?:[.][a-z][a-z])?)/i;
  let shortenedUrlValidation = /^[a-z0-9]+$/;
  let urlValid = urlValidation.test(reqPath.slice(1));
  let shortenedUrlValid = shortenedUrlValidation.test(reqPath.slice(1));

  if (shortenedUrlValid) {
    openURL(reqPath.slice(1))
  }
  else {
    if (urlValid) {
      sendShortenedUrl(urlValid)
    }
    else if (!validExtension) {
      let errorMessage = {
        ERROR: 'Invalid URL address'
      }	
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write(JSON.stringify(errorMessage));
      res.end();
    }
  }
}).listen(port);


function getValidExtension (ext) {
  const validExtensions = {
        '.html' : 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.txt': 'text/plain',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.png': 'image/png',
        '.ico': 'image/png',
  };
  return validExtensions[ext];
}

function handleStaticFileRequest(req, res) {
  let reqPath = (req.url=='/') ? '/frontPage.html' : req.url;
  let ext = path.extname(reqPath);
  let validExtension = getValidExtension(ext);
  
  if (validExtension) {
	  validPath = path.join(process.cwd(), reqPath);
	  fs.open(validPath, 'r', (err, fd) => {
		  if (!err) {
        fs.readFile(fd, 'binary', (err, file) => {
          if (err) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Failed to load requested page');  
          }
          res.setHeader('Content-Type', validExtension);
          res.statusCode = 200;	
          res.write(file, 'binary');
          res.end();
        })
      }
	  })
  }
}

function openURL(pass) {
  MongoClient.connect(dbUrl, (err, client) => {
    if(err) console.log('Failed to connect with database');
    
    findUrlWithPassword(client, pass, (err, data, html) => {
      if(err) console.log('Failed to find url address');
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
}

//find the original url address through the password:
function findUrlWithPassword(client, pass, callback){
  const db = client.db(dbName)
  const collection = db.collection('kindofurls');
  
  collection.find({password: pass}).toArray((err, doc) => {
    if(err) callback(err);
    if(doc.length!=0){
      let url = doc[0]['original'];
      let html = `<script>window.open('${url}','_self')</script>`
      callback(null, null, html);
    }
    else{
      myMessage = {
        ERROR: 'Short URL address not in the database'
      };
      callback(null, myMessage);
    }
    client.close();
  });
}

function sendShortenedUrl(urlValid, reqPath, req, res, client) {
  const myHost = req.headers.host;
  
  MongoClient.connect(dbUrl, (err, client) => {
  
    // turn all url to same format
    let originalUrl = reqPath.slice(1).replace(urlValid, `http$1://www.$2.com$3`); 
    
    if(err){
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Failed to connect with the database');  
    }
    const db = client.db(dbName)
    const collection = db.collection('kindofurls');
    
    getShortenedURL(originalUrl, myHost, collection, client, (err, data) => {
      if(err){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Failed to perform database operations');  
      } 
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.write(JSON.stringify(data));
      res.end();
    });
  });
}


function getShortenedURL(originalUrl, myHost, collection, client, callback){	
  addUrlSavePassword(originalUrl, collection, client, (err, data) => {
    if(err) callback(err);
    collection.find({original: originalUrl}).toArray((err, data) => {
      if(err) callback(err);

      let password = data[0]['password'];
      const shortUrl = `http://${myHost}/${password}`;
      let myMessage = {
        original_url: originalUrl,
        short_url:	shortUrl	
      }  
      callback(null, myMessage);
      client.close();
    });
  });
}

function addUrlSavePassword(url, collection, client, callback){
  addUrlOnceToDB(collection, url, (err, data) => { 
    if(err) callback(err);
  });
  getIdFromUrl(collection, url, (err, id) => {
    if(err) callback(err);
    //the short url address path will consist of the last 5 digits of the 
    //id provided by the database for a specific web address			
    let password = id.toString().slice(-5);
    
    savePasswordOnDB(collection, url, password, (err, data) => {
      if(err) callback(err);
      callback(err, data);
      client.close();					
    });
  });
}

//insert original url address, only if it is not already in the database:
function addUrlOnceToDB(collection, url, callback){
  collection.updateOne({original: url}, {$set: {original: url}}, {upsert: true}, (err, data) => {
    if(err) callback(err);
    callback(null, data);
  });
}

//puts a password key into a document
function savePasswordOnDB(collection, url, pass, callback){
  collection.updateOne({original: url}, {$set: {password: pass}}, {upsert: true}, (err, data) => {
    if(err) callback(err);
    callback(null, data);
  });
}

//find the _id of a stored URL:
function getIdFromUrl(collection, url, callback){
  collection.find({original: url}, {projection: {_id: 1}}).toArray((err, doc) => {
    if(err) callback(err);
    let id = doc[0]['_id'];
    callback(null, id);
  });
}
