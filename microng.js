var app = angular.module('playerApp', []);
/* app.filter('commaSpace', function() {
  return function(input){
    var mangle = JSON.stringify(input);
    mangle.replace(',',', ','g');
    return mangle;
  };
}); */

app.controller('playerController', ['$scope',
    function($scope) {
    $scope.messageData = messageData;
    $scope.pretty = function(input){
      return JSON.stringify(input,null,2);
    };
}]);
