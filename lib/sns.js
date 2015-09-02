var AWS = require('aws-sdk'),
    async = require('async'),
    debug = require('debug')('lambda:push-notifications');

function sendMessage(sns, applicationArn, recipientToken, message, done) {
  sns.createPlatformEndpoint({
    PlatformApplicationArn: applicationArn,
    Token: recipientToken
  }, function(err, data) {
    if (err) {
      debug('Unable to create a platform endpoint for application ' +
        applicationArn + ' with token ' + recipientToken);
      debug(err, err.stack);
      return done(err);
    }

    sns.publish({
      TargetArn: data.EndpointArn,
      Message: message,
      MessageStructure: 'json'
    }, function(err) {
      if (err) {
        debug('Unable to publish to ' + data.EndpointArn);
        debug(err, err.stack);
        return done(err);
      }

      done();
    });
  });
}

function taskFactory(sns, options, message) {
  var tasks = [];

  if (message.gcm && message.gcm_recipients && message.gcm_recipients.length > 0) {
    var gcmPayload = JSON.stringify({
      'default': '',
      'GCM': JSON.stringify({ data: message.gcm })
    });

    debug('Sending notifications to ' + message.gcm_recipients.length + ' GCM endpoints...');

    message.gcm_recipients.forEach(function(recipient) {
      tasks.push(function(next) {
        sendMessage(sns, options.gcm.application, recipient, gcmPayload, function(err) {
          if (err) {
            debug('Unable to send GCM message.', err);
            return next(err);
          }

          next();
        });
      });
    });
  }

  if (message.apns && message.apns_recipients && message.apns_recipients.length > 0) {
    var apnsKey = options.apns.sandbox ? 'APNS_SANDBOX' : 'APNS';
    var apnsPayload = { 'default': '' };

    apnsPayload[apnsKey] = JSON.stringify({ aps: message.apns });
    apnsPayload = JSON.stringify(apnsPayload);

    debug('Sending notifications to ' + message.apns_recipients.length + ' APNS endpoints...');

    message.apns_recipients.forEach(function(recipient) {
      tasks.push(function(next) {
        sendMessage(sns, options.apns.application, recipient, apnsPayload, function(err) {
          if (err) {
            debug('Unable to send APNS message.', err);
            return next(err);
          }

          next();
        });
      });
    });
  }

  return tasks;
}

module.exports = function(options) {
  var sns = new AWS.SNS(options.sns);

  return function(message, done) {
    var tasks = taskFactory(sns, options, message);

    async.parallel(tasks, function(err) {
      debug('Completed ' + tasks.length + ' tasks.');
  		done(err);
  	});
  };
};
