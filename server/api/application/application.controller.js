'use strict';

var _ = require('lodash');
var _s = require('underscore.string');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var json2csv = require('json2csv');
var Application = require('./application.model');
var User = require('../user/user.model');
var FileSystem = require('../../components/filesystem');
var multiparty = require('multiparty');
var email = require('../../utils/email');
var sanitizeHtml = require('sanitize-html');

var multipartyOptions = {
  maxFilesSize: 50 * 1024
};

// Get list of applications
exports.index = function(req, res) {
  Application.find()
  .populate('user', 'name email role')
  .where('user').ne(null).exec(function (err, applications) {
    if(err) { return handleError(res, err); }
    return res.json(200, {data: applications});
  });
};

// Get list of applications for sponsors
exports.sponsors = function (req, res) {
  if (req.user.role !== 'sponsor' && req.user.role !== 'mainsponsor') {
    res.send(403);
    return;
  }

  var conditions = {
    submitted: true
  };

  if (req.user.role !== 'mainsponsor') {
    conditions.status = 'accepted';
  }

  Application.find(conditions, {'user': 1, 'personalInformation.profiles': 1, 'status': 1, 'submitted': 1})
  .populate('user', 'name email role')
  .where('user').ne(null).exec(function (err, applications) {
    if (err) { return handleError(res, err); }
    return res.json(200, {data: applications});
  });
}

exports.showMe = function(req, res) {
  req.params.id = req.user._id;
  exports.show(req, res);
}

// Get a single application
exports.show = function(req, res) {
  Application.findOne({'user': req.params.id}, function (err, application) {
    if (err) { return handleError(res, err); }
    if (!application) { 
      var emptyApplication = {
        personalInformation: {},
        additionalInformation: {},
        conditionsAccepted: false,
        codeOfConductAccepted: false,
        cvUploaded: false
      }
      return res.json(emptyApplication);
    }
    return res.json(application);
  });
};

exports.updateMe = function(req, res) {
  req.params.id = req.user._id;
  exports.update(req, res);
}

// Updates an existing application in the DB.
exports.update = function(req, res) {
  var filename = req.user._id + '.pdf';
  
  FileSystem.doesFileExist(filename, 'cvs', function (err, exists) {
    if (err) {
      return res.json(500, {error: 'CVRETRIEVALFAILED', message: 'Internal Server Error'});
    }
    
    if (!req.body.application.codeOfConductAccepted) {
      return res.json(400, {error: 'NOCODEOFCONDUCT', message: 'You need to accept the code of conduct.'});
    }
    
    if (!req.body.application.conditionsAccepted) {
      return res.json(400, {error: 'NOCONDITIONSACCEPTED', message: 'You need to accept the terms and conditions.'});
    }
    
    var newApplication = !req.body.application.submitted;
    
    req.body.application.user = req.user._id;
    req.body.application.lastSaved = Date.now();
    req.body.application.submitted = true;
    req.body.application.cvUploaded = exists;
    var test = new Application(req.body.application);
    test.validate(function (err) {
      if (err) { 
        if (err.name === 'ValidationError')
          err.message += '. Nice try :)';
        return handleError(res, err); 
      }
      Application.update({'user': req.params.id}, req.body.application, {upsert: true}, function (err, application) {
        if (err) { return handleError(res, err); }
        if (newApplication) {
          email.send(req.user.email, 'Thanks for applying for jacobsHack! 2015', email.TEMPLATES.application(req.user.name), function (err, info) {
            if (err) {
              console.error('FAILED TO SEND APPLICATION EMAIL', err);
            }
          });
        }
        
        return res.json(200, {success: true});
      }); 
    });
  });
};

exports.saveMe = function(req, res) {
  req.params.id = req.user._id;
  exports.save(req, res);
}

// Updates an existing application in the DB.
exports.save = function(req, res) {
  var application = JSON.parse(JSON.stringify(req.body.application));
  application.user = req.user._id;
  application.lastSaved = Date.now();
  var test = new Application(application);
  test.validate(function (err) {
    if (err) { 
      if (err.name === 'ValidationError')
        err.message += '. Nice try :)';
      return handleError(res, err); 
    }
    Application.update({'user': req.params.id}, {$set: application}, {upsert: true}, function (err, app) {
      if (err) { return handleError(res, err); }
      var returnJson = {success: true, lastSaved: application.lastSaved};
      return res.json(200, returnJson);
    }); 
  });
};

// Deletes a application from the DB.
// exports.destroy = function(req, res) {
//   Application.findById(req.params.id, function (err, application) {
//     if(err) { return handleError(res, err); }
//     if(!application) { return res.send(404); }
//     application.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };

exports.uploadCV = function (req, res) {
  var form = new multiparty.Form(multipartyOptions);
  form.on('part', function (part) {
    if (!part.filename) {
      return handleError(res, 'No file specified');
    }
    
    if (part.filename) {
        var newFileName = req.user._id + '.pdf';
        var size = part.byteCount;
        FileSystem.writeFile(part, size, newFileName, 'cvs', function (err) {
          if (err) 
            return handleError(res, err);
          return res.send(200, newFileName);
        });
    } else {
        form.handlePart(part);
    }
  });
  form.parse(req);
}

exports.getCV = function (req, res) {
  if (req.params.filename !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'sponsor' && req.user.role !== 'mainsponsor') 
    return res.send(403, 'No permission to see the file');
  var filename = req.params.filename + '.pdf';
  
  User.findById(req.params.filename, function (err, user) {
    if (err) { return handleError(res, err); }
    if (!user) { return res.send(404); }
    
    var downloadFileName = _s.slugify(user.name) + '.pdf';
    
    FileSystem.getFile(filename, 'cvs', function (err, stream) {
      if (err) { return res.send(500); }
      
      res.setHeader('Content-disposition', 'attachment; filename=' + downloadFileName);
      res.setHeader('Content-type', 'application/pdf');
      
      return stream.pipe(res);
    });
  });
}

exports.accept = function (req, res) {
  var userId = req.params.id;
  Application.findOne({'user': userId}, function (err, application) {
    if (err) { return handleError(res, err); }
    if (!application) { return res.send(404, { error: 'NOAPPLICATION', message: 'No application found'}); }
    application.status = 'accepted';
    application.save(function (err, application) {
      if (err) { return handleError(res, err); }
      res.send(200);
    });
  });
}

exports.reject = function (req, res) {
  var userId = req.params.id;
  Application.findOne({'user': userId}, function (err, application) {
    if (err) { return handleError(res, err); }
    if (!application) { return res.send(404, { error: 'NOAPPLICATION', message: 'No application found'}); }
    application.status = 'rejected';
    application.save(function (err, application) {
      if (err) { return handleError(res, err); }
      res.send(200);
    });
  });
}

exports.exportAll = function (req, res) {
  exportAsCsv({}, 'all.csv', req, res);
}

exports.exportAccepted = function (req, res) {
  exportAsCsv({status: 'accepted'}, 'accepted.csv', req, res);
}

exports.exportVisaNeeded = function (req, res) {
  exportAsCsv({'personalInformation.visaNeeded': true}, 'visaNeeded.csv', req, res);
}

exports.exportPending = function (req, res) {
  exportAsCsv({submitted: {$exists: false}}, 'pending.csv', req, res);
}

function exportAsCsv (filter, name, req, res) {
  var fieldNames = ['Status','Submitted','Name','Email','Visa Needed','University','Birthday','Nationality','Street','City','State','Country','Phone','CV','Participant Type','Shirt Type','Shirt Size','Dietary Restrictions','Code of Conduct','Terms & Conditions'];
  var fields = ['status','submitted','personalInformation.name','personalInformation.email','personalInformation.visaNeeded','personalInformation.university','personalInformation.birthday','personalInformation.nationality','personalInformation.address.street','personalInformation.address.city','personalInformation.address.state','personalInformation.address.country','personalInformation.phone','cvUploaded','additionalInformation.discipline','additionalInformation.shirt.type','additionalInformation.shirt.size','additionalInformation.dietaryRestrictions','codeOfConductAccepted','conditionsAccepted'];
  Application.find(filter, function (err, applications) {
    json2csv({data: applications, fields: fields, fieldNames: fieldNames, nested: true}, function (err, csv) {
      if (err) {
        return res.send('FAILED TO RETRIEVE DATA');
      }
      
      res.attachment(name);
      res.send(200, csv);
    });
  });
} 

exports.emailAccepted = function (req, res) {
  Application.find({status: 'accepted'}, function (err, applications) {
    if (err) {
      handleError(res, err);
      return;
    }
    
    emailUsers(req, res, applications);
    return;
  })
}

exports.emailRejected = function (req, res) {
  Application.find({status: 'rejected'}, function (err, applications) {
    if (err) {
      handleError(res, err);
      return;
    }
    
    emailUsers(req, res, applications);
    return;
  })
}

exports.emailUnfinished = function (req, res) {
  Application.find({submitted: {$exists: false}}, function (err, applications) {
    if (err) {
      handleError(res, err);
      return;
    }
    
    emailUsers(req, res, applications);
    return;
  })
}

exports.emailEveryone = function (req, res) {
  Application.find({}, function (err, applications) {
    if (err) {
      handleError(res, err);
      return;
    }
    
    emailUsers(req, res, applications);
    return;
  })
}

exports.emailCustom = function (req, res) {
  var applicationEmails = req.body.emails.split(',');
  
  Application.find().where('personalInformation.email').in(applicationEmails).exec(function (err, applications) {
    if (err) {
      handleError(res, err);
      return;
    }
    
    emailUsers(req, res, applications);
    return;
  });
}


function emailUsers(req, res, receipients) {
  if (!req.body.content || !req.body.subject) {
    res.send(400, {name: 'BadRequest', message: 'Invalid Request'});
    return;
  }
  
  var emailsSent = 0;
  var emailsFailed = 0;
  var emailContent = email.TEMPLATES.general(sanitizeHtml(req.body.content.replace(/(?:\r\n|\r|\n)/g, '<br />')));
  
  for (var i = 0; i < receipients.length; i++) {
    email.send(receipients[i].personalInformation.email, sanitizeHtml(req.body.subject), emailContent(receipients[i].personalInformation.name), function (err, info) {
      if (err) {
        emailsFailed++;
      }
      emailsSent++;
      if(emailsSent === receipients.length) {
        if (emailsFailed !== 0) {
          res.json(500, {name: 'FAILEDEMAILS', message: emailsFailed + ' out of ' + emailsSent + ' failed!' });
          return;  
        }
        
        res.json(200, {message: emailsSent + ' Emails sent!'});
      }
    });
  }
}


function handleError(res, err) {
  return res.send(500, err);
}