angular.module('starter.controllers', [])

.controller('ScanProductCtrl', function($scope,$cordovaBarcodeScanner,Products,$state) {
  $scope.$on('$ionicView.enter', function() {
    // Code you want executed every time view is opened
    $scope.scanBarcode();
  });

  $scope.scanBarcode = function() {
    $cordovaBarcodeScanner.scan().then(function(imageData) {
      $state.go('tab.product-details',{productId: imageData.text});
      // console.log("Barcode Format -> " + imageData.format);
      // console.log("Cancelled -> " + imageData.cancelled);
    }, function(error) {
      console.log("An error happened -> " + error);
      alert('unable to read barcode.. Try again');
    });
  };

  //The controller will be loaded only when the user press the button
  try {
    // $scope.scanBarcode();
  }catch (err){
    // console.log(err);
  }
  // Products.get(37000274018).then(function(product){
  //   console.log(product);
  // });

  $scope.dummyScan = function(){
    $state.go('tab.product-details',{productId: 37000274018});
  }
})

.controller('ProductDetailCtrl', function($scope, $stateParams, Products) {
    $scope.product = {};
    $scope.isLoading = true;
    $scope.isNeedToConfrim = true;
    $scope.noProductFound = false;
    Products.get($stateParams.productId).then(function(product){
      $scope.isLoading = false;
      if(product.name) {
        console.log(product);
        $scope.product = product;
      }else{
        $scope.noProductFound = true;
      }
    });

    $scope.confirm = function(){
      $scope.isNeedToConfrim = false;
    };

    $scope.reject = function(){
      $scope.isNeedToConfrim = false;
    }
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('loginCtrl', function($scope, $rootScope, $state, AuthService,$ionicLoading) {

  ionic.Platform.ready(function(){

  });
  $scope.user = {};
  $scope.isError = false;
  $scope.errorMessage = '';
  $scope.login = function() {
    $scope.isError = false;
    console.info('Authentication...');
    $ionicLoading.show();
    AuthService.login($scope.user.email,$scope.user.password)
      //In case of authentication
      .then(function(response){
      console.log(response);
      $ionicLoading.hide();
      $state.go('tab.account');
      },function(err){
        console.log(err);
        $ionicLoading.hide();
        if(Array.isArray(err.data)){
            $scope.errorMessage = err.data[0].msg;
        }else{
            $scope.errorMessage = err.data.msg;
        }
        $scope.isError = true;
      });
  }
})

.controller('registerCtrl', function($scope,AuthService,$state,$ionicLoading) {
  $scope.user= {};
  $scope.isError = false;
  $scope.errorMessage = '';
  $scope.signup = function(){
    $scope.isError = false;
    $ionicLoading.show();
    AuthService.signup($scope.user)
      .then(function(response) {
        console.log(response);
        $ionicLoading.hide();
        $state.go('tab.account');
      },function(err){
        $ionicLoading.hide();
        console.log(err);
        if(Array.isArray(err.data)){
          $scope.errorMessage = err.data[0].msg;
        }else{
          $scope.errorMessage = err.data.msg;
        }
        $scope.isError = true;
      });
  }
});
