"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('isomorphic-fetch');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const TOKEN = '8cVJhp6TA0fU1gEsFawEussX';

const validRequest = (token) => {
  return TOKEN == token;
};

const prepareResponse = (info, paramToGet) => {
  let response = { response_type: "ephemeral", mrkdwn: true };
  const newLine = '\n';
  response.text = '*Github User: @' + info.login + ' (' + info.name + ')*:' + newLine;
  if (!paramToGet) {
    response.text += '> Company: ' + info.company + newLine;
    response.text += '> Location: ' + info.location + newLine;
    response.text += '> Hireable: ' + info.hireable + newLine;
    response.text += '> Github Profile: ' + info.html_url + newLine;
  }
  else {
    response.text += '> ' + paramToGet.charAt(0).toUpperCase() + paramToGet.slice(1) + ': ';
    response.text += info[paramToGet];
  }
  return response;
};

app.get('/', (req,res) => {
  res.send('ok');
});

app.post('/', (req, res) => {
  if (!validRequest(req.body.token)) {
    res.status(400).send();
    return;
  }
  if (!req.body.text) {
    res.status(400).send({
      response_type: 'ephemeral',
      text: "Please specify a user to find."
    });
    return;
  }
  const cmd = req.body.text.split(' '),
        user = cmd[0],
        paramToGet = cmd[1];
  fetch(`https://api.github.com/users/${username}`).then((resp) => {
    const result = JSON.parse(resp);
    res.send(prepareResponse(result, paramToGet));
  }).catch((err) => {
    let errMsg = { response_type: "ephemeral" };
    if('statusCode' in err && err.statusCode == 404) {
      errMsg.text = "Sorry. Unable to find that user.";
      res.status(err.statusCode).send(errMsg);
    }
    else {
      const status = err.statusCode ? err.statusCode : 500;
      errMsg.text = "Oops! Something went wrong. Please try again.";
      res.status(status).send(errMsg);
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