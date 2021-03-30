const findURLWithPassword = require('./findURLWithPassword');
const getShortenedURL = require('./getShortenedURL');
const MongoClient = require('mongodb').MongoClient;
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;


const dbUrl = 'mongodb://'+dbuser+':'+dbpassword+'@ds014388.mlab.com:14388/myprotodata';
const dbName = 'myprotodata';

const openURL = (pass, req, res) => {
  MongoClient.connect(dbUrl, (err, client) => {
    if(err) {
      console.log('Failed to connect with database');
    }  
    else {
      const db = client.db(dbName)
      const collection = db.collection('kindofurls');
      
      findURLWithPassword(collection, pass, (err, data, html) => {
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
        client.close();  
      });
    }
  });
}

const sendShortenedUrl = (urlValid, req, res) => {
  let reqPath = (req.url=='/') ? '/frontPage.html' : req.url;
  const myHost = req.headers.host;
  
  MongoClient.connect(dbUrl, (err, client) => {
    // turn all url to same format
    let originalUrl = reqPath.slice(1).replace(urlValid, `http$1://www.$2.com$3`); 
    
    if (err) {
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
      client.close();
    });
  });
}

module.exports = { openURL, sendShortenedUrl };
