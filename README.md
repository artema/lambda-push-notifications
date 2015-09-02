Amazon Web Services Lambda based push notifications. Publish notifications to a single SNS topic and broadcast push notifications to APNS and GCM services from a Lambda function.

# Installation

```
npm install lambda-push-notifications --save
```

# Usage

Create a Lambda function with an SNS event source:

```
var factory = require('lambda-push-notifications');

exports.handler = function(event, context) {
  var handler = factory({
    //Configure SNS for the AWS SDK for Node here
    sns: {
      region: 'us-west-2'
    },
    //APNS application for push notifications
    apns: {
      sandbox: false,
      application: 'arn:aws:sns:us-west-2:123456789:app/APNS/APNS_APPLICATION'
    },
    //GCM application for push notifications
    gcm: {
      application: 'arn:aws:sns:us-west-2:123456789:app/GCM/GCM_APPLICATION'
    }
  });

  handler(event, function(err) {
    //Ignore EndpointDisabled errors
    if (err && err.code !== 'EndpointDisabled') {
      return context.done(err, 'Task failed.');
    }

    context.succeed();
  });
};
```

Source SNS topic should receive notifications in the following format:

```
{
  apns: { alert: 'Test message', badge: 1, sound: 'default' }
  gcm: { text: 'Test message', data: 12345 }
  apns_recipients: ['APNS device token'],
  gcm_recipients: ['GCM device token']
}
```
