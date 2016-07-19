'use strict'

describe 'Controller: ApplyCtrl', ->

  # load the controller's module
  beforeEach module('jacobshackApp')
  ApplyCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject(($controller, $rootScope) ->
    scope = $rootScope.$new()
    ApplyCtrl = $controller('ApplyCtrl',
      $scope: scope
    )
  )
  it 'should ...', ->
    expect(1).toEqual 1
