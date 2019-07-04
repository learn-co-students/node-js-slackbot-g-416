"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const TOKEN = '8cVJhp6TA0fU1gEsFawEussX';

const hasValidToken = req => req.body.token === TOKEN;

const getGithubUserData = username => rp({
		uri: 'https://api.github.com/users/' + username,
		headers: {
        	'User-Agent': 'lair001'
    	}
	});

const respondToRequestForGithubUserDate = (req, res) => {
		const options = req.body.text.trim().split(/\s+/),
			username = options[0],
			requestedInfo = options[1];

		return getGithubUserData(username)
					.then(dataStr => res.send(
						generateResponseToRequestForValidUserData(
							dataStr, requestedInfo)))
					.catch(err => {
						const errMsg = { response_type: "ephemeral" };
						if (err.statusCode === 404 || err.statusCode === '404') {
							errMsg.text = `Unable to find user ${username}.`
							res.status(404).send(errMsg);
						} else {
							const status = err.statusCode ? err.statusCode : 500;
      						errMsg.text = "Oop! Something went wrong. Please try again.";
      						res.status(status).send(errMsg);
						}
					});
	};

const generateResponseToRequestForValidUserData = (dataStr, requestedInfo) => {
		const dataJson = JSON.parse(dataStr),
			EOL = "\n",
			response = { response_type: "ephemeral", mrkdwn: true };

		response.text = '*Github User: @' + dataJson.login + ' (' + dataJson.name + ')*:' + EOL;

		if (typeof requestedInfo === 'string' && /^\s*[a-zA-Z]/.test(requestedInfo)) {
			response.text += '> ' + requestedInfo.charAt(0).toUpperCase() + requestedInfo.slice(1) + ': ';
    		response.text += dataJson[requestedInfo] + EOL;
		} else {
			response.text += '> Company: ' + dataJson.company + EOL;
    		response.text += '> Location: ' + dataJson.location + EOL;
    		response.text += '> Hireable: ' + dataJson.hireable + EOL;
    		response.text += '> Githup Profile: ' + dataJson.html_url + EOL;
		}

		return response;

	};

app.use(bodyParser.urlencoded({ extended: true }));

// Just an example request to get you started..
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/', (req, res) => {

	if (!hasValidToken(req)) return res.status(400).send({ text: "Token is invalid." });
	if (typeof req.body.text !== 'string' || !/^\s*[a-zA-Z0-9]/.test(req.body.text)) return res.status(400).send({ text: "Please specify a user to find."});
	respondToRequestForGithubUserDate(req, res);
});

// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};