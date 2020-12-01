var Twit = require('twit');
var fs = require("fs");
var { exec } = require('child_process');


var T = new Twit({
  consumer_key:         'jOihZ2m0ZVQnt65eN3EFsBw31',
  consumer_secret:      'FSQR6hhwrlHHwtOYQx22uFNbOdDV95EJ4nKM9gfiuDtY22Pg6T',
  access_token:         '980873561886937088-oYAsAxnr4K0NbirSWB9y7gzLm56m9qy',
  access_token_secret:  'iXj8iUGXX48CuoBTM8MGuSVM3pWYcBvuHd0rolVpBYg7a',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

//Look for a printable jpg file
var myArgs = process.argv.slice(2);
fs.writeFile('../discord_bot/twitter_info.txt', myArgs.length, (err) => {
        if (err) throw err;
        console.log('mediaId saved to file');
});
if(myArgs.length > 0){
    T.post('statuses/destroy/:id', { id: myArgs[0] }, function (err, data, response) {
    console.log(data);
    })
}
else{
    try{
        var b64content = fs.readFileSync('../discord_bot/pic_to_post.jpg', { encoding: 'base64' });
    }catch(err){
        try{
            //if you don't find it look for a printable png file
            var b64content = fs.readFileSync('../discord_bot/pic_to_post.png', { encoding: 'base64' });
        }catch(err){
            //if you don't find it then just give up
            console.log("no file to send found");
            return;
        }
    }

    // first we must post the media to Twitter
    T.post('media/upload', { media_data: b64content }, function (err, data, response) {
      // now we can assign alt text to the media, for use by screen readers and
      // other text-based presentations and interpreters
      var mediaIdStr = data.media_id_string;
      fs.writeFile('../discord_bot/twitter_info.txt', mediaIdStr, (err) => {
        if (err) throw err;
        console.log('mediaId saved to file');
      });
      var altText = "hype stuff boiiiee";
      var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

      T.post('media/metadata/create', meta_params, function (err, data, response) {
        if (!err) {
          // now we can reference the media and post a tweet (media will attach to the tweet)
          var params = { status: 'it worked afjaoewjf', media_ids: [mediaIdStr] }

          T.post('statuses/update', params, function (err, data, response) {
            console.log(data)
          })
        }
      })
    })

    exec("cd ../discord_bot && rm pic_to_post.*", (err, stout, stderr) => {
        if(err){
            console.error(`exec error: ${err}`);
            return;
        }
    });
}

