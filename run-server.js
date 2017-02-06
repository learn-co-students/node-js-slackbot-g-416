const server = require('./slack_bot');

server.listen(3000, () => {
  console.log('Server is up and listening on localhost:3000');
});