var debug = require('debug')('lambda:push-notifications'),
    factory = require('./sns');

module.exports = function(options) {
  var handler = factory(options);

  return function(event, done) {
    var message;

    try {
      message = JSON.parse(event.Records[0].Sns.Message);
    }
    catch(e) {
      return done(e);
    }
    
    debug('Received message:', message);

    handler(message, done);
  };
};
