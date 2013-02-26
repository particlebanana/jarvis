/**
 * JARVIS
 */

var Listener = require('./listener'),
    fs = require('fs'),
    redis = require("redis"),
    client = redis.createClient();

var Jarvis = module.exports = function(args) {
  this.args = args || {};
  this.name = this.args.name || "Jarvis";

  this.commands = [];
  this.listeners = [];
  this.storage = client;
  this.redis = redis;

  this.loadTasks();
};

Jarvis.prototype.getName = function getName() {
  // adds padding to end of name to match msg cmd
  return this.name.toUpperCase() + ' ';
};

/**
 * Add a new Listener
 */
Jarvis.prototype.hear = function hear(regex, callback) {
  this.listeners.push(new Listener(this, regex, callback));
};

/**
 * Receive a Message and if it matches the bot name
 * pass it off to the listeners.
 */

Jarvis.prototype.receive = function receive(msg) {
  var cmd;

  cmd = msg.split(this.getName());
  if(!cmd[1]) return false;

  this.listeners.forEach(function(listener) {
    listener.call(cmd[1]);
  });

};

/**
 * Load Tasks
 */

Jarvis.prototype.loadTasks = function loadTasks() {
  var self = this,
      tasks = fs.readdirSync(__dirname + '/tasks');

  tasks.forEach(function(task) {
    require(__dirname + '/tasks/' + task)(self);
  });
};
