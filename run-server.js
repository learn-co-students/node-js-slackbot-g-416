const server = require('./slack_bot');

server.listen(3000, () => {
  console.log('Listening on port 3000...');
});