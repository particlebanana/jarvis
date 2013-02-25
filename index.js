var spawn = require('child_process').spawn,
    Jarvis = require('./lib/jarvis');

var jarvis = new Jarvis(),
    speech = spawn('jarvis');

speech.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

speech.stderr.on('data', function (data) {
  var res = data.toString().split(":");

  if(res[0] === "RESULT") {
    if(!res[1]) return false;
    jarvis.receive(res[1]);
  }
});

speech.on('exit', function (code) {
  console.log('child process exited with code ' + code);
});