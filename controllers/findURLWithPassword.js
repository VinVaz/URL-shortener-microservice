
//find the original url address through the password:
const findURLWithShortened = (collection, pass, callback) => {
  collection.find({password: pass}).toArray((err, doc) => {
    if (err) callback(err);
    if (doc.length!=0) {
      let url = doc[0]['original'];
      let html = `<script>window.open('${url}','_self')</script>`
      callback(null, null, html);
    }
    else {
      myMessage = {
        ERROR: 'Short URL address not in the database'
      };
      callback(null, myMessage);
    }
  });
}


module.exports = findURLWithShortened;
