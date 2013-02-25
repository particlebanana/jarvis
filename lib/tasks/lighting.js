var five = require("johnny-five");

module.exports = function(jarvis) {

  var publisher = jarvis.redis.createClient();

  /**
   * Listen for commands to control lighting
   */

  jarvis.hear(/lights on\s?(living room|dining room|bedroom|study)?/i, function(msg, args) {
    var data = {
      zone: args[1] || null,
      command: 'on'
    };

    publisher.publish('lighting', JSON.stringify(data));
  });

  jarvis.hear(/lights off\s?(living room|dining room|bedroom|study)?/i, function(msg, args) {
    var data = {
      zone: args[1] || null,
      command: 'off'
    };

    publisher.publish('lighting', JSON.stringify(data));
  });

};