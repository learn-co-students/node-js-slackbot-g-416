"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const TOKEN = '8cVJhp6TA0fU1gEsFawEussX';

const validateRequest = (token) => {
  return TOKEN == token;
};

const getUser = (username) => {
  const url =  'https://api.github.com/users/' + username;
  return rp({
    uri: url,
    headers: {
        'User-Agent': 'Flatiron-Slackbot-Lab'
    },
  });
};

const formatResponse = (info, params) => {
  let resp = { response_type: "ephemeral", mrkdwn: true };
  const EOL = '\n';
  resp.text = '*Github User: @' + info.login + ' (' + info.name + ')*:' + EOL;
  if (!params) {
    resp.text += '> Company: ' + info.company + EOL;
    resp.text += '> Location: ' + info.location + EOL;
    resp.text += '> Hireable: ' + info.hireable + EOL;
    resp.text += '> Githup Profile: ' + info.html_url + EOL;
  }
  else {
    resp.text += '> ' + params.charAt(0).toUpperCase() + params.slice(1) + ': ';
    resp.text += info[params];
  }
  return resp;
};

app.get('/', (req,res) => {
  res.send('ok');
});

app.post('/', (req, res) => {
  if (!validateRequest(req.body.token)) {
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
  getUser(user).then((resp) => {
    const result = JSON.parse(resp);
    res.send(formatResponse(result, paramToGet));
  }).catch((err) => {
    let errMsg = { response_type: "ephemeral" };
    if('statusCode' in err && err.statusCode == 404) {
      errMsg.text = "Sorry. Unable to find that user.";
      res.status(err.statusCode).send(errMsg);
    }
    else {
      const status = err.statusCode ? err.statusCode : 500;
      errMsg.text = "Oop! Something went wrong. Please try again.";
      res.status(status).send(errMsg);
    }
  });
});


exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
