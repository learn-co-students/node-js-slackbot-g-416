const server = require('./slack_bot');

 server.listen(3000, () => {
  console.log(`app listening on port 3000!`);
});