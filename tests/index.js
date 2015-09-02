require('debug').enable("*:*");

var factory = require('./../lib');

exports.handler = function(event, context) {
  var handler = factory({
    sns: {
      region: 'us-west-2'
    },
    apns: {
      sandbox: false,
      application: 'arn:aws:sns:us-west-2:123:app/APNS/APNS_APP'
    },
    gcm: {
      application: 'arn:aws:sns:us-west-2:123:app/GCM/GCM_APP'
    }
  });

  handler(event, function(err) {
    if (err && err.code !== 'EndpointDisabled') {
      return context.done(err, 'Task failed.');
    }

    context.succeed();
  });
};
