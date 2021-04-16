const findURLWithPassword = require('./findURLWithPassword');
const getShortenedURL = require('./getShortenedURL');
const MongoClient = require('mongodb').MongoClient;
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;


const dbUrl = 'mongodb://'+dbuser+':'+dbpassword+'@ds014388.mlab.com:14388/myprotodata';
const dbName = 'myprotodata';

const openShortenedUrl = (pass, req, res) => {
  MongoClient.connect(dbUrl, (err, client) => {
    if(err) {
      console.log('Failed to connect with database');
    }  
    else {
      const db = client.db(dbName)
      const collection = db.collection('kindofurls');
      
      findURLWithPassword(collection, pass, (err, data, html) => {
        if(err) console.log('Failed to find url address')
        else {
          if(html){
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(html);
            res.end();
          }
          else if(data){
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write(JSON.stringify(data));
            res.end();
          }
        }
        client.close();  
      });
    }
  });
}

const sendShortenedUrl = (urlValid, req, res) => {
  let reqPath = req.url;
  const myHost = req.headers.host;
  
  MongoClient.connect(dbUrl, (err, client) => {
    // format different URLs
    let originalUrl = reqPath.slice(1).replace(urlValid, `http$1://www.$2.com$3`); 
    res.writeHead(200, {'Content-Type': 'text/plain'});
    
    if (err) {  
      res.write('Failed to connect with the database');  
    }
    else {
      const db = client.db(dbName)
      const collection = db.collection('kindofurls');
      
      getShortenedURL(originalUrl, myHost, collection, (err, data) => {
        if(err){
          res.write('Failed to perform a database operation');  
        } 
        else if(data){
          res.write(JSON.stringify(data));
        }
        client.close();
      });
    }
    res.end();
  });
}

module.exports = { openShortenedUrl, sendShortenedUrl };
