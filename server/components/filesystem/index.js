var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var config = require('../../config/environment');
var azure = require('azure-storage');
var blobService;
var isProd = config.env === 'production';

if (isProd) {
  blobService = azure.createBlobService(config.azure.storage_account, config.azure.storage_access_key);
  blobService.createContainerIfNotExists('cvs', {}, function(error, result, response){
    if(!error){
      console.log(error);
    }
  });
}

exports.getFile = function getFile (filename, folder, callback) {
  folder = folder || 'cvs';
  
  if (isProd) {
    callback(null, blobService.createReadStream(folder, filename, {}, function (err, blob) {
      console.log('AZURE', err, blob);
    }));
  } else {
    var __parentdir = path.dirname(process.mainModule.filename);
    var basePath = path.join(process.env.DATA_PATH, folder);
    var filePath = path.join(basePath, filename);
    
    if (fs.existsSync(filePath)) {
      callback(null, fs.createReadStream(filePath));
    } else {
      callback({err: 'No file found'}); 
    };
  }
}

exports.writeFile = function writeFile (stream, size, filename, folder, callback) {
  folder = folder || 'cvs';
  if (isProd) {
    blobService.createBlockBlobFromStream(folder, filename, stream, size, {contentType: 'application/pdf'}, function(error, result, response) {
      console.log('AZURE', result, response);
      callback(error);
    });
  } else {
    // FS
    var __parentdir = path.dirname(process.mainModule.filename);
    var basePath = path.join(process.env.DATA_PATH, folder);
    var newPath = path.join(basePath, filename);
    
    mkdirp.sync(basePath);
    var writeStream = fs.createWriteStream(newPath);
    stream.pipe(writeStream);
    stream.on('end', function () {
      callback(null);
    });
  }
}

exports.doesFileExist = function doesFileExist (filename, folder, callback) {
  folder = folder || 'cvs';
  if (isProd) {
    blobService.doesBlobExist(folder, filename, callback);
  } else {
    var __parentdir = path.dirname(process.mainModule.filename);
    var basePath = path.join(process.env.DATA_PATH, folder);
    var newPath = path.join(basePath, filename);
    
    callback(null, fs.existsSync(newPath));
  }
}

exports.deleteFileIfExists = function deleteBlobIfExists (filename, folder, callback) {
  folder = folder || 'cvs';
  
  if (isProd) {
    blobService.deleteBlobIfExists(folder, filename, callback);
  } else {
    var __parentdir = path.dirname(process.mainModule.filename);
    var basePath = path.join(process.env.DATA_PATH, folder);
    var itemPath = path.join(basePath, filename);
    
    fs.unlink(itemPath, function (err) {
      callback(err);
    });
  }
}