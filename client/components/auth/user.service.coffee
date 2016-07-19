'use strict'

angular.module 'jacobshackApp'
.factory 'User', ($resource) ->
  $resource '/api/users/:id/:controller',
    id: '@_id'
  ,
    changePassword:
      method: 'PUT'
      params:
        controller: 'password'

    makeAdmin:
      method: 'PUT'
      params:
        controller: 'admin'

    removeAdmin:
      method: 'DELETE'
      params:
        controller: 'admin'

    get:
      method: 'GET'
      params:
        id: 'me'

