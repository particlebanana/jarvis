/**
 * Listener receives messages and decides whether
 * or not to act on it.
 */

var Listener = module.exports = function(jarvis, matcher, callback) {
  this.jarvis = jarvis;
  this.matcher = matcher;
  this.callback = callback;
};

Listener.prototype.call = function call(msg) {
  var match = msg.match(this.matcher);
  if(match)
    this.callback(msg, match);
};