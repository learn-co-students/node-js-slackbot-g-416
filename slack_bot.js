"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const TOKEN = 'BTWxJGR3icJ8y41z2MjCQ6hW';

app.use(bodyParser.urlencoded({ extended: true }));

// Just an example request to get you started..
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {
  if (req.body.token != TOKEN) return res.status(400).json({ text: 'Sorry, wrong auth token!' });

  if (!req.body.text) {
    res.status(400).json({ text: 'Sorry, something went wrong!' });
    
  } else if (req.body.text.length > 0) {
    let username = req.body.text;

    var options = {
      uri: `https://api.github.com/users/${username}`,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true
    };
   
    rp(options)
      .then(function (result) {
        res.json({
          "text": `${result.login}\n${result.html_url}`,
          "attachments": [
            {
                "fallback": "Github info.",
                "color": "#36a64f",
                "pretext": "Here is the Github info you requested:",
                "author_name": result.login,
                "author_link": result.html_url,
                "author_icon": result.avatar_url,
                "fields": [
                  {
                    "title": "Bio",
                    "value": result.bio,
                    "short": false
                  },
                  {
                    "title": "Github Url",
                    "value": result.html_url,
                    "short": false
                  }
                ],
                "footer": "Github API",
                "footer_icon": "https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png",
            }
          ]
        });
      })
      .catch(function (err) {
        console.error(err.message);
        res.status(404).json({ text: 'Sorry, something went wrong!' });
      });
  }
});

// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
