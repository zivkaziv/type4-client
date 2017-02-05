angular.module('starter.controllers', [])

.controller('ScanProductCtrl', function($scope,$cordovaBarcodeScanner) {
  $scope.scanBarcode = function() {
    $cordovaBarcodeScanner.scan().then(function(imageData) {
      alert(imageData.text);
      console.log("Barcode Format -> " + imageData.format);
      console.log("Cancelled -> " + imageData.cancelled);
    }, function(error) {
      console.log("An error happened -> " + error);
    });
  };
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

.controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state) {
  $scope.user = {};

  $scope.login = function() {
    LoginService.loginUser($scope.user.email, $scope.user.password).success(function(data) {
      $state.go('tab.dash');
    }).error(function(data) {
      $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  }
});

//FireBaseLogin
// .controller('loginCtrl', function($scope,$rootScope,$ionicHistory,sharedUtils,$state,$ionicSideMenuDelegate) {
//   $rootScope.extras = false;  // For hiding the side bar and nav icon
//
//   // When the user logs out and reaches login page,
//   // we clear all the history and cache to prevent back link
//   $scope.$on('$ionicView.enter', function(ev) {
//     if(ev.targetScope !== $scope){
//       $ionicHistory.clearHistory();
//       $ionicHistory.clearCache();
//     }
//   });
//
//
//
//
//   //Check if user already logged in
//   firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//
//       $ionicHistory.nextViewOptions({
//         historyRoot: true
//       });
//       $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
//       $rootScope.extras = true;
//       sharedUtils.hideLoading();
//       $state.go('menu2', {}, {location: "replace"});
//
//     }
//   });
//
//
//   $scope.loginEmail = function(formName,cred) {
//
//
//     if(formName.$valid) {  // Check if the form data is valid or not
//
//       sharedUtils.showLoading();
//
//       //Email
//       firebase.auth().signInWithEmailAndPassword(cred.email,cred.password).then(function(result) {
//
//           // You dont need to save the users session as firebase handles it
//           // You only need to :
//           // 1. clear the login page history from the history stack so that you cant come back
//           // 2. Set rootScope.extra;
//           // 3. Turn off the loading
//           // 4. Got to menu page
//
//           $ionicHistory.nextViewOptions({
//             historyRoot: true
//           });
//           $rootScope.extras = true;
//           sharedUtils.hideLoading();
//           $state.go('menu2', {}, {location: "replace"});
//
//         },
//         function(error) {
//           sharedUtils.hideLoading();
//           sharedUtils.showAlert("Please note","Authentication Error");
//         }
//       );
//
//     }else{
//       sharedUtils.showAlert("Please note","Entered data is not valid");
//     }
//
//
//
//   };
//
//
//   $scope.loginFb = function(){
//     //Facebook Login
//   };
//
//   $scope.loginGmail = function(){
//     //Gmail Login
//   };
//
//
// })

  //Signup
// .controller('signupCtrl', function($scope,$rootScope,sharedUtils,$ionicSideMenuDelegate,
//                                      $state,fireBaseData,$ionicHistory) {
//     $rootScope.extras = false; // For hiding the side bar and nav icon
//
//     $scope.signupEmail = function (formName, cred) {
//
//       if (formName.$valid) {  // Check if the form data is valid or not
//
//         sharedUtils.showLoading();
//
//         //Main Firebase Authentication part
//         firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).then(function (result) {
//
//           //Add name and default dp to the Autherisation table
//           result.updateProfile({
//             displayName: cred.name,
//             photoURL: "default_dp"
//           }).then(function() {}, function(error) {});
//
//           //Add phone number to the user table
//           fireBaseData.refUser().child(result.uid).set({
//             telephone: cred.phone
//           });
//
//           //Registered OK
//           $ionicHistory.nextViewOptions({
//             historyRoot: true
//           });
//           $ionicSideMenuDelegate.canDragContent(true);  // Sets up the sideMenu dragable
//           $rootScope.extras = true;
//           sharedUtils.hideLoading();
//           $state.go('menu2', {}, {location: "replace"});
//
//         }, function (error) {
//           sharedUtils.hideLoading();
//           sharedUtils.showAlert("Please note","Sign up Error");
//         });
//
//       }else{
//         sharedUtils.showAlert("Please note","Entered data is not valid");
//       }
//
//     }
//
//   });
