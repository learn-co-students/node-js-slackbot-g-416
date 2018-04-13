"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');

// app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const TOKEN = 'tq2rcy2LsqcYiE0WHZb25AvK';

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {
  // res.set('Content-Type', 'application/json');

  // if (req.body.token !== TOKEN) {
  //   res.status(400).send();
  //   return;
  // }

  if (!req.body.text) {
    res.status(400).send({
        response_type: "ephemeral",
        mrkdwn: true,
        text: 'Invalid Username!'
      });
    return;
  }

  const username = req.body.text.split(' ')[0] || req.body.text;
  const requested = req.body.text.split(' ')[1] || false;

  rp({
      uri: `https://api.github.com/users/${username}`,
      headers: {
        'User-Agent': 'Lab'
      }
    })
    .then(response => {
      response = JSON.parse(response);

      res.send({
        response_type: "ephemeral",
        mrkdwn: true,
        text: `
          ${response.login} (${response.id} - ${response.html_url}) \n
          ${(requested) ? `${requested}: ${response[requested]}` : ''}`
      });
    })
    .catch(err => {
      res.status(404).send({
        response_type: "ephemeral",
        text: "User not found!"
      });
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

// { token: 'tq2rcy2LsqcYiE0WHZb25AvK',
//   team_id: 'TA5C77UKB',
//   team_domain: 'denisatk',
//   channel_id: 'CA5U98S3U',
//   channel_name: 'general',
//   user_id: 'UA6QZBLHL',
//   user_name: 'denis.atkesone',
//   command: '/getgit',
//   text: '',
//   response_url: 'https://hooks.slack.com/commands/TA5C77UKB/345544545856/nYWNNQwfU5Gqt2B467XRrN1Z' }


/* data:
{ login: 'kheyro',
  id: 10345706,
  avatar_url: 'https://avatars2.githubusercontent.com/u/10345706?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/kheyro',
  html_url: 'https://github.com/kheyro',
  followers_url: 'https://api.github.com/users/kheyro/followers',
  following_url: 'https://api.github.com/users/kheyro/following{/other_user}',
  gists_url: 'https://api.github.com/users/kheyro/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/kheyro/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/kheyro/subscriptions',
  organizations_url: 'https://api.github.com/users/kheyro/orgs',
  repos_url: 'https://api.github.com/users/kheyro/repos',
  events_url: 'https://api.github.com/users/kheyro/events{/privacy}',
  received_events_url: 'https://api.github.com/users/kheyro/received_events',
  type: 'User',
  site_admin: false,
  name: 'Denis A.',
  company: null,
  blog: '',
  location: null,
  email: null,
  hireable: true,
  bio: null,
  public_repos: 412,
  public_gists: 3,
  followers: 0,
  following: 0,
  created_at: '2014-12-30T04:13:41Z',
  updated_at: '2018-04-09T20:13:59Z' } } */
