var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../config/environment');

var TRANSPORT = nodemailer.createTransport(smtpTransport({
    host: 'smtp.zoho.com',
    port: 465,
    auth: {
        user: config.zoho.email,
        pass: config.zoho.password
    },
    secure: true
  })
);

var WRAPPER = [
  '<html>',
  '<body>',
  '{{CONTENT}}',
  '</body>',
  '</html>'
].join('');

var tmpls = {};

tmpls.forgotten = function (email, id) {
  var raw = [
    '<p>',
    'Hi,',
    '</p>',
    '<p>',
    'You requested a new password. Please follow this link to set your new password:<br>',
    '<a href="https://my.jacobshack.com/reset-password/{{ID}}">https://my.jacobshack.com/reset-password/{{ID}}</a>',
    '</p>',
    '<p>',
    'Cheers,<br>',
    'Your jacobsHack! Team',
    '</p>',
    '<p>',
    '<small><strong>NOTE:</strong> This is an automatically generated email. Please do not reply to it. Also the link is only valid for 30 minutes.</small>',
    '</p>'
  ].join('');

  var templated = raw.replace(/{{ID}}/g, id);

  return WRAPPER.replace(/{{CONTENT}}/g, templated);
}

tmpls.application = function (name) {
  var raw = [
    '<p>',
    'Hi {{NAME}},',
    '</p>',
    '<p>',
    'You successfully applied for jacobsHack! 2015.<br>',
    '</p>',
    '<p>',
    'We will be reviewing applications on a rolling basis and notify you as soon as you are accepted. ',
    'In the meantime you can always go back to ',
    '<a href="https://my.jacobshack.com">my.jacobshack.com</a>',
    ' and update your application.',
    '</p>',
    '<p>',
    'Cheers,<br>',
    'Your jacobsHack! Team',
    '</p>',
    '<p>',
    '<small><strong>NOTE:</strong> This is an automatically generated email. Please do not reply to it.</small>',
    '</p>'
  ].join('');

  var templated = raw.replace(/{{NAME}}/g, name);

  return WRAPPER.replace(/{{CONTENT}}/g, templated);
}

tmpls.general = function (body) {
  var raw = [
    '<p>',
    'Hi {{NAME}},',
    '</p>',
    '<p>',
    '{{BODY}}',
    '</p>',
    '<p>',
    'Cheers,<br>',
    'Your jacobsHack! Team',
    '</p>',
    '<p>',
    '<small><strong>NOTE:</strong> This is an automatically generated email. Please do not reply to it.</small>',
    '</p>'
  ].join('');
  
  var templated = raw.replace(/{{BODY}}/g, body);
  
  return function (name) {
    var fullTemplate = templated.replace(/{{NAME}}/g, name);
    
    return WRAPPER.replace(/{{CONTENT}}/g, fullTemplate); 
  }
}

exports.TEMPLATES = tmpls;

exports.send = function (to, subject, body, callback) {
  var mailOptions = {
    from: 'noreply@jacobshack.com',
    to: to,
    subject: subject,
    html: body
  };

  TRANSPORT.sendMail(mailOptions, callback);
}