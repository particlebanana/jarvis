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
    var timeframe = 'today',
        today = new Date(),
        stamp = (today.getMonth() + 1) + '-' + today.getDate() + '-' + today.getFullYear(),
        cache_key;

    if(['today', 'tomorrow'].indexOf(args[1].toLowerCase()) >= 0)
      timeframe = args[1].toLowerCase();

    if(timeframe === 'tomorrow')
      stamp = (today.getMonth() + 1) + '-' + (today.getDate() + 1) + '-' + today.getFullYear();

    cache_key = "wunderground:" + stamp;

    jarvis.storage.get(cache_key, function(err, res) {
      var data = res ? JSON.parse(res) : null;
      if(data && data.expire > (today.getTime() / 1000)) {
        speak(timeframe, data);
      } else {
        exec("espeak --stdout 'Let me check on that' | aplay", function() {

          var callback = function(weather) {
            if(!weather) {
              exec("espeak --stdout 'There was a problem looking up the weather' | aplay");
              return false;
            }

            jarvis.storage.set(cache_key, JSON.stringify(weather));
            speak(timeframe, weather);
          };

          switch(timeframe) {
            case 'today':
              getCurrent(callback);
              break;
            case 'tomorrow':
              getFuture(1, callback);
              break;
          }
        });
      }
    });
  });

  var speak = function(timeframe, data) {
    var words, cmd;

    switch(timeframe) {
      case 'today':
        words = "It is currently " + data.conditions + ' and ' + data.temp + ' degrees out with a high of ' + data.high + ' and a low of ' + data.low;
        break;
      case 'tomorrow':
        words = "Tomorrows forecast is " + data.conditions + ' with a high of ' + data.high + ' and a low of ' + data.low;
        break;
    }

    cmd = "espeak --stdout '" + words + "' | aplay";
    exec(cmd);
  };

  var getCurrent = function(callback) {
    var conditions = "http://api.wunderground.com/api/" + process.env.WUNDERGROUND_KEY + "/conditions/q/TX/" + process.env.WUNDERGROUND_LOCATION + ".json",
        forecast = "http://api.wunderground.com/api/" + process.env.WUNDERGROUND_KEY + "/forecast/q/TX/" + process.env.WUNDERGROUND_LOCATION + ".json";

    request(conditions, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        var conditions = JSON.parse(body);

        request(forecast, function(err, res, data) {
          if (!err && res.statusCode == 200) {
            var forecast = JSON.parse(data);

            var weather = {
              conditions: forecast.forecast.simpleforecast.forecastday[0].conditions,
              temp: Math.round(conditions.current_observation.temp_f),
              high: Math.round(forecast.forecast.simpleforecast.forecastday[0].high.fahrenheit),
              low: Math.round(forecast.forecast.simpleforecast.forecastday[0].low.fahrenheit),
              rain: forecast.forecast.simpleforecast.forecastday[0].qpf_allday.in,
              expire: Math.round((new Date()).getTime() / 1000) + 3600
            };

            return callback(weather);
          }
          return callback();
        });
      }
    });
  };

  var getFuture = function(offset, callback) {
    var forecast = "http://api.wunderground.com/api/" + process.env.WUNDERGROUND_KEY + "/forecast/q/TX/" + process.env.WUNDERGROUND_LOCATION + ".json";

    request(forecast, function(err, res, data) {
      if (!err && res.statusCode == 200) {
        var forecast = JSON.parse(data);

        var weather = {
          conditions: forecast.forecast.simpleforecast.forecastday[offset].conditions,
          high: Math.round(forecast.forecast.simpleforecast.forecastday[offset].high.fahrenheit),
          low: Math.round(forecast.forecast.simpleforecast.forecastday[offset].low.fahrenheit),
          rain: forecast.forecast.simpleforecast.forecastday[offset].qpf_allday.in,
          expire: Math.round((new Date()).getTime() / 1000) + 3600
        };

        return callback(weather);
      }
      return callback();
    });
  };

};