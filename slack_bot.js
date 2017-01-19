"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const TOKEN = 'jV4S74yrPolWsvb7nb2akrN1';
const gitApi = 'https://api.github.com/users/wedesignstudios'

const getGitUser = (userLogin) => {
  return rp({
    uri: 'https://api.github.com/users/' + userLogin,    
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true
  });    
}

const prepSlashTxt = (response, gitParam) => {
  gitParam = gitParam.toLowerCase();
  
  let finalTxt = {};
  let nl = '\n';
  let customParam = response[gitParam];

  if(gitParam === undefined) {

    finalTxt.text = `GitHub info for ${response.login}:${nl}`;
    finalTxt.text += `Username: ${response.login}${nl}`;
    finalTxt.text += `URL: ${response.html_url}${nl}`;
    finalTxt.text += `Location: ${response.location}`;

  } else if(customParam != undefined) {

    finalTxt.text = `GitHub info for ${response.login}:${nl}`;
    finalTxt.text += `${gitParam}: ${customParam}${nl}`;

  } else {
    finalTxt.text = `Sorry, that is not a valid GitHub parameter for ${response.login}. Please try another.${nl}A list of valid parameters can be found at: https:\/\/developer.github.com/v3/users/#get-a-single-user${nl}Correct format: \/gitget [GitHub username] [GitHub parameter]`;
  }
  
  return finalTxt;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Just an example request to get you started..
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {   

  if (req.body.token == (TOKEN)) {
    const slashTxt = req.body.text.split(' ');    

    getGitUser(slashTxt[0])
      .then((gitRes) => {        
        res.send(prepSlashTxt(gitRes, slashTxt[1]));
      })
      .catch((err) => {        
        if('statusCode' in err && err.statusCode == 404) {
          res.status(err.statusCode).send('Sorry, that GitHub user was not found. Please try another.');
          return;         
        }
      }); 

  } else {

    res.status(400).send('Bad Request');

  };  
  
});

// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};