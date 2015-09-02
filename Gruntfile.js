var AWS = require('aws-sdk'),
    pkg = require('./package.json');

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    lambda_invoke: {
      default: {
        options: {
          'file_name': './tests/index.js',
          'handler': 'handler',
          'event': './tests/event.json'
        }
      }
    }
  });

  grunt.registerTask('default', []);
  grunt.registerTask('test', ['lambda_invoke']);
};
