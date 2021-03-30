const getShortenedURL = (originalUrl, myHost, collection, callback) => {	
  addUrlSavePassword(originalUrl, collection, client, (err, data) => {
    if(err) callback(err);
    collection.find({original: originalUrl}).toArray((err, data) => {
      if (err) callback(err);

      let password = data[0]['password'];
      const shortUrl = `http://${myHost}/${password}`;
      let myMessage = {
        original_url: originalUrl,
        short_url:	shortUrl	
      }  
      callback(null, myMessage);
    });
  });
}

const addUrlSavePassword = (url, collection, callback) => {
  addUrlOnceToDB(collection, url, (err, data) => { 
    if (err) callback(err);
  });
  getIdFromUrl(collection, url, (err, id) => {
    if (err) callback(err);
    //the short url address path will consist of the last 5 digits of the
    //id provided by the database for a specific web address
    let password = id.toString().slice(-5);
    
    savePasswordOnDB(collection, url, password, (err, data) => {
      if (err) callback(err);
      callback(err, data);				
    });
  });
}

//insert original url address, only if it is not already in the database:
const addUrlOnceToDB = (collection, url, callback) => {
  collection.updateOne({original: url}, {$set: {original: url}}, {upsert: true}, (err, data) => {
    if (err) callback(err);
    callback(null, data);
  });
}

//puts a password key into a document
const savePasswordOnDB = (collection, url, pass, callback) => {
  collection.updateOne({original: url}, {$set: {password: pass}}, {upsert: true}, (err, data) => {
    if (err) callback(err);
    callback(null, data);
  });
}

//find the _id of a stored URL:
const getIdFromUrl = (collection, url, callback) => {
  collection.find({original: url}, {projection: {_id: 1}}).toArray((err, doc) => {
    if (err) callback(err);
    let id = doc[0]['_id'];
    callback(null, id);
  });
}

module.exports = getShortenedURL;
