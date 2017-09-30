"use strict";

const chai = require('chai');
const expect = require('unexpected');
const request = require('supertest');
const server = require('../slack_bot');
const baseUrl = 'http://localhost:3000';

const transformData = (obj) => {
  var str = [];
  for(var p in obj)
  str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
};

const clone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

let mockSlackPostData = {
  token: 'BTWxJGR3icJ8y41z2MjCQ6hW',
  team_id: 'T02KU9PH6',
  team_domain: 'codecuts',
  channel_id: 'C02KU9PJJ',
  channel_name: 'general',
  user_id: 'U02KU9PHE',
  user_name: 'ethan',
  command: '/github',
  response_url: 'https://hooks.slack.com/commands/T02KU9PH6/41072273780/lodzbFlyr5UaQuev3NkHJYAN' };

describe('server', () => {

  before(() => {
    server.listen(3000);
  });

  it('GET request to / responds with status 200', (done) => {
    request(baseUrl)
      .get('/')
      .expect(200, done);
  });

  it('POST to / with invalid token returns 400', (done) => {
    let data = clone(mockSlackPostData);
    data.token = '111111111111111';
    request(baseUrl)
      .post('/')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send(transformData(data))
      .expect(400,done);
  });

  it('POST to / for existent user returns correctly ', (done) => {
    let data = clone(mockSlackPostData);
    data.text = 'flatiron-school';
    request(baseUrl)
      .post('/')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send(transformData(data))
      .expect(200)
      .end((err, resp) => {
        const respObj = JSON.parse(resp.text);
        expect(respObj, 'to have key', 'text');
        expect(respObj.text, 'to contain', 'flatiron-school');
        expect(respObj.text, 'to contain', 'https://github.com/flatiron-school');
        done();
      });
  });

  it('POST to / with nonexistent user specified returns 404 code and msg', (done) => {
    let data = clone(mockSlackPostData);
    data.text = '76ytjf0';
    request(baseUrl)
      .post('/')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send(transformData(data))
      .expect(404)
      .end((err, resp) => {
        if(err) return done(err);
        const respObj = JSON.parse(resp.text);
        expect(respObj, 'to have key', 'text');
        done();
      });
  });

  it('POST to / with slack data with no user specified returns 400 and msg', (done) => {
    let data = clone(mockSlackPostData);
    data.text = '';
    request(baseUrl)
      .post('/')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send(transformData(mockSlackPostData))
      .expect(400)
      .end((err, resp) => {
        if (err) return done(err);
        const respObj = JSON.parse(resp.text);
        expect(respObj, 'to have key', 'text');
        done();
      });
  });

  it('POST to / with user and specific paramter to fetch returns correctly', (done) => {
    let data = clone(mockSlackPostData);
    data.text = 'flatiron-school id';
    request(baseUrl)
      .post('/')
      .set('Accept', 'application/x-www-form-urlencoded')
      .send(transformData(data))
      .expect(200)
      .end((err, resp) => {
        if (err) return done(err);
        const respObj = JSON.parse(resp.text);
        expect(respObj, 'to have key', 'text');
        expect(respObj.text, 'to contain', '2180076');
        done();
      });
  });
});
