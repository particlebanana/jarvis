/**
 * Weather Task
 *
 * Looks up the weather forecast for your location
 * and speaks it to you.
 */

var request = require('request'),
    exec = require('child_process').exec;

module.exports = function(jarvis) {

  jarvis.hear(/(weather)+|(today|tomorrow)+/gi, function(msg, args) {
    var timeframe = 'today';

    if(args[1])
      timeframe = args[1].toLowerCase();

    var today = new Date();
    var stamp = (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getFullYear();

    if(timeframe === 'tomorrow') {
      stamp = (today.getMonth() + 1) + '-' + (today.getDate() + 1) + '-' + today.getFullYear();
    }

    var cache_key = "wunderground:" + stamp;

    jarvis.storage.get(cache_key, function(err, res) {
      if(res) {
        // Data is cached, no need to fetch it
        var data = JSON.parse(res);
        speak(data);
      } else {
        console.log('Looking up the weather...');
        getCurrent(function(weather) {
          // Error Getting the weather
          if(!weather) return false;

          jarvis.storage.set(cache_key, JSON.stringify(weather));
          speak(weather);
        });
      }
    });

  });

  var speak = function(data) {
    var words = "It is currently " + data.temp + ' degrees out with a high of ' + data.high + ' and a low of ' + data.low,
        cmd = "espeak --stdout '" + words + "' | aplay";

    exec(cmd, function() {});
  };

  var getCurrent = function(callback) {
    var conditions = "http://api.wunderground.com/api/" + process.env.WUNDERGROUND_KEY + "/conditions/q/TX/Austin.json",
        forecast = "http://api.wunderground.com/api/" + process.env.WUNDERGROUND_KEY + "/forecast/q/TX/Austin.json";

    request(conditions, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        var conditions = JSON.parse(body);

        request(forecast, function(err, res, data) {
          if (!err && res.statusCode == 200) {
            var forecast = JSON.parse(data);

            var weather = {
              temp: Math.round(conditions.current_observation.temp_f),
              high: Math.round(forecast.forecast.simpleforecast.forecastday[0].high.fahrenheit),
              low: Math.round(forecast.forecast.simpleforecast.forecastday[0].low.fahrenheit),
              rain: forecast.forecast.simpleforecast.forecastday[0].qpf_allday.in,
              timestamp: Math.round((new Date()).getTime() / 1000)
            };

            return callback(weather);
          }
          return callback();
        });
      }
      return callback();
    });
  };

};