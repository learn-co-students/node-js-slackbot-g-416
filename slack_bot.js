"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const TOKEN = 'BlEj60TFj0W1J6ojzNlUbc6o';

app.use(bodyParser.urlencoded({ extended: true}));

class User{
  constructor(user){
    this.login = user.login;
    this.id = user.id;
    this.url = user.url;
    this.gists_url = user.gists_url
    this.type = user.type;
    this.name = user.name;
    this.blog = user.blog;
    this.location = user.location;
    this.public_repos = user.public_repos;
    this.hireable = user.hireable;
  }
}

const validReq = (token) => {
  return TOKEN == token;
}
const slackMsg = (user) => {
  return `${user.name} \n
          Username: ${user.login} \n
          Location: ${user.location} \n
          Url: ${user.url} \n
          Blog: ${user.blog} \n`
}
const paramsMsg = (usr, text) => {
  return `${usr.name}'s ${text}: ${usr[text]}`
}
const getUser = (username) => {
  const url = `https://api.github.com/users/${username}`;
  return rp({
    uri: url,
    headers: {
    'User-Agent': 'GetGitBot'
    }
  })
}

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {
  if (!validReq(req.body.token)){
    res.status(400).send();
    return;
  }
  if(!req.body.text){
    res.status(400).send({
      response_type: 'ephemeral',
      text: "Please input a user to find."
    });
    return;
  }
  const textParams = req.body.text.split(" "),
     username = textParams[0],
     userParams = textParams[1];
  getUser(username).then((resp) => {
      const user = new User(JSON.parse(resp));
      if (userParams !== undefined && user[userParams] !== undefined){
        res.send(paramsMsg(user, userParams))
      }else if (userParams !== undefined && user[userParams] == undefined){
        res.send("Sorry that attribute couldn't be found. Please try another.")
      }else{
        res.send(slackMsg(user));
    }
    }).catch((err) =>{
      if('statusCode' in err && err.statusCode == 404) {
        res.status(err.statusCode).send("That user could not be found. Try another spelling?");
      }
      else {
        const status = err.statusCode ? err.statusCode : 500;
        res.status(status).send("Sorry! There seems to be an error.");
      }
    });
  });



// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
