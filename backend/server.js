var http = require('http');

http.createServer(function (req, res) {
  const json = JSON(res)
  console.log(res.payload)
  res.write("webhook recieved succesfully")
  res.end()
}).listen(1337);