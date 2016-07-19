var appInsights = require('applicationinsights');
var uuid = require('node-uuid');
var config = require('../../config/environment');

function Initialize(options) {
  options = options || {};
  if (options.productionOnly && config.env !== 'production') {
    return function (req, res, next) {
      next();
    }
  }
  
  appInsights.setup(config.azure.appinsights)
    .setAutoCollectRequests(false)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .start();
  
  function RequestInterceptor (req, res, next) {
    var correlation_id = uuid.v4();
    req.correlation_id = req.correlation_id || correlation_id;
    appInsights.client.trackRequest(req, res);
    next();
  }
  
  return RequestInterceptor;
}

module.exports = Initialize;