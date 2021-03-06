angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope,
                                 $state,
                                 $rootScope,
                                 $cordovaBarcodeScanner,
                                 GoogleAnalyticsService,
                                 MixpanelService,
                                 $window) {
  $scope.$on('$ionicView.enter', function() {
    GoogleAnalyticsService.sendEvent('menu-buttons', 'home', 'home', 'click');
    MixpanelService.track('menu-button-clicked',{'button name' : 'home'});
  });

  $scope.currentlyScanning = false;

  function error() {
    console.warn('Camera permission is not turned on');
  }

  function success( status ) {
    if( !status.hasPermission ) error();
  }

  if($window.cordova && $window.cordova.plugins) {
    var permissions = $window.cordova.plugins.permissions;
    permissions.requestPermission(permissions.CAMERA, success, error);
  }
  
  $scope.scanBarcode = function() {
    if(!$scope.currentlyScanning) {
      $scope.currentlyScanning = true;
      MixpanelService.track('home-button-clicked', {'button name': 'scan'});
      GoogleAnalyticsService.sendEvent('home-buttons', 'scan', 'scan', 'click');
      try {
        $cordovaBarcodeScanner.scan().then(function (imageData) {
          if (imageData.cancelled) {
            $scope.currentlyScanning = false;
            $state.go('tab.home');
          } else {
            $scope.currentlyScanning = false
            $state.go('tab.product-details-home', {productId: imageData.text});
          }
        }, function (error) {
          $scope.currentlyScanning = false
          console.log("An error happened -> " + error);
          // alert('unable to read barcode.. Try again');
        });
      } catch (err) {
        $scope.currentlyScanning = false
        console.log(err);
        // $scope.dummyScan();
      }
    }
  };

  $scope.dummyScan = function(){
    //Working product
    // $state.go('tab.product-details',{productId: 37000274018});

    //Not found product
    // $state.go('tab.product-details',{productId: 1234});

    //No ingredients
    // $state.go('tab.product-details',{productId: 8717163023839});
    // $state.go('tab.product-details-home',{productId: 0037000143104});
    $state.go('tab.product-details-home',{productId: 0072140002541});
  };

  $scope.shouldShowHomeWalkThrough = false;
  setTimeout(function(){
    if($rootScope.isFirstTimeInHomeTab) {
      $scope.shouldShowHomeWalkThrough = true;
    }
    $rootScope.isFirstTimeInHomeTab = false;
  },100);

  $scope.$on('cloud:push:notification', function(event, data) {
    try {
      var eventData = {
        'message': data.message
      };
      eventData.ab_test = data.ab_test ? data.ab_test : 'NA';
      eventData.msg_type = data.msg_type ? data.msg_type : 'NA';
      MixpanelService.track('push-message-received', {});
    }catch (err){
      console.log(err);
    }
    var msg = data.message;
    alert(msg.title + ': ' + msg.text);
  });

  // if(push) {
  //   push.on('notification', function (data) {
  //     // do something with the push data
  //     try {
  //       var eventData = {
  //         'message': data.message
  //       };
  //       eventData.ab_test = data.ab_test ? data.ab_test : 'NA';
  //       eventData.msg_type = data.msg_type ? data.msg_type : 'NA';
  //       MixpanelService.track('push-message-received', {});
  //     }catch (err){
  //       console.log(err);
  //     }
  //     var msg = data.message;
  //     alert(msg.title + ': ' + msg.text);
  //     // then call finish to let the OS know we are done
  //     push.finish(function () {
  //       console.log("processing of push data is finished");
  //     }, function () {
  //       console.log("something went wrong with push.finish for ID = " + data.additionalData.notId)
  //     }, data.additionalData.notId);
  //   });
  // }
})

.controller('ScanProductCtrl', function($scope,$cordovaBarcodeScanner,Products,$state,GoogleAnalyticsService,MixpanelService) {
  $scope.$on('$ionicView.enter', function() {
    // Code you want executed every time view is opened
    // $scope.scanBarcode();
    MixpanelService.track('menu-button-clicked',{'button name' : 'scan'});
    GoogleAnalyticsService.sendEvent('menu-buttons','scan','scan','click');
  });

  $scope.scanBarcode = function() {
    $cordovaBarcodeScanner.scan().then(function(imageData) {
      if(imageData.cancelled){
        $state.go('tab.home');
      }else {
        $state.go('tab.product-details', {productId: imageData.text});
      }
      // console.log("Barcode Format -> " + imageData.format);
      // console.log("Cancelled -> " + imageData.cancelled);
    }, function(error) {
      // console.log("An error happened -> " + error);
      // alert('unable to read barcode.. Try again');
    });
  };

  $scope.dummyScan = function(){
    //Working product
    // $state.go('tab.product-details',{productId: 37000274018});

    //Not found product
    // $state.go('tab.product-details',{productId: 1234});

    //No ingredients
    // $state.go('tab.product-details',{productId: 8717163023839});
    $state.go('tab.product-details',{productId: 0037000143104});
  };
})

.controller('ProductDetailCtrl',
  function($scope, $stateParams,
           Products,$rootScope,
           $location,$state,
           GoogleAnalyticsService,
           MixpanelService,
           $cordovaCamera,ImageUploadFactory,
           CloudinaryConfigs) {

    $scope.loadProduct = function(isNeedConfirm,isReload) {
      return Products.get($stateParams.productId).then(function (product) {
        $scope.isLoading = false;
        $scope.product = product;
        if (product.name) {
          $scope.handleIsSafe();
          $scope.isNeedToConfrim = $scope.product.ingredient_analysis.length === 0 || !isNeedConfirm? false : true;
          GoogleAnalyticsService.sendEvent('search-results', 'found', 'barcode', $stateParams.productId);
          var eventName = 'found';
          if ($scope.product.ingredient_analysis.length == 0) {
            eventName = 'found-no-ingredient'
          }
          MixpanelService.track('search-results', {
            'result': eventName,
            'barcode': $stateParams.productId,
            'num_of_ingredients': $scope.product.ingredient_analysis.length,
            'analysis_result': $scope.product.analysis_result
          });
          // console.log(product);
          if (!$rootScope.user || !$rootScope.user.searches) {
            $rootScope.user.searches = [];
          }
          if(isReload){
            //Update product in search
            for(var searchIndex = 0; searchIndex < $rootScope.user.searches.length; searchIndex++){
              if($rootScope.user.searches[searchIndex].barcode_id === $scope.product.barcode_id) {
                $rootScope.user.searches[searchIndex] = $scope.product;
              }
            }
          }else{
            //add to user history only if it's not exist
            if(!isProductExistInUserSearch(product)) {
              $rootScope.user.searches.push(product);
            }
          }

        } else {
          GoogleAnalyticsService.sendEvent('search-results', 'not-found', 'barcode', $stateParams.productId);
          MixpanelService.track('search-results', {'result': 'not-found', 'barcode': $stateParams.productId});
          $scope.noProductFound = true;
          $state.go('tab.add-product', {productId: $stateParams.productId});
        }
      },function(err){
        console.log(err);
        GoogleAnalyticsService.sendEvent('search-results', 'timeout', 'barcode', $stateParams.productId);
        MixpanelService.track('search-results', {'result': 'timeout', 'barcode': $stateParams.productId});
        $scope.noProductFound = true;
        $state.go('tab.add-product', {productId: $stateParams.productId});
      });
    };

    $scope.product = {
      barcode_id:''
    };

    $scope.isNeedToConfrim = false;
    $scope.noProductFound = false;
    $scope.reportProductText = 'Report a problem';
    $scope.reactedText = 'I reacted to this product';
    $scope.show = false;

    $scope.handleIsSafe = function(){
      if($scope.product && !$scope.product.hasOwnProperty('analysis_result') &&  $scope.product.ingredient_analysis.length > 0){
        $scope.product.analysis_result ='SAFE';
        for(var ingredientIndex = 0 ; $scope.product.ingredient_analysis.length; ingredientIndex++){
          if($scope.product.ingredient_analysis[ingredientIndex].analysis === 'SENSITIVE' ||
            $scope.product.ingredient_analysis[ingredientIndex].analysis === 'UNKNOWN'){
            $scope.product.analysis_result = 'NOT_SAFE';
            break;
          }
        }
      }
      if($scope.product.ingredient_analysis.length === 0){
        $scope.product.analysis_result ='UNKNOWN';
      }

      updateReportButtonText();
      updateReactedButtonText();
    };


    if(!foundProductInUserHistory()) {
      $scope.isLoading = true;
      $scope.loadProduct(true,false);
    }else{
      if($location.search().from_history) {
        GoogleAnalyticsService.sendEvent('product-details', 'history', 'barcode', $stateParams.productId);
        MixpanelService.track('product-details', {'reference': 'history', 'barcode_id': $stateParams.productId});
      }
    }

    $scope.confirm = function(){
      GoogleAnalyticsService.sendEvent('search-results','confirm','barcode', '$stateParams.productId');
      MixpanelService.track('search-results',{'user_confirmation':'confirm','barcode' : $stateParams.productId});
      $scope.isNeedToConfrim = false;
      };

    $scope.reject = function(){
      GoogleAnalyticsService.sendEvent('search-results','reject','barcode', '$stateParams.productId');
      MixpanelService.track('search-results',{'user_confirmation':'reject','barcode' : $stateParams.productId});
      $state.go('tab.productscan');
    };

    $scope.reportProblematicProduct = function(){
      MixpanelService.track('report-product',{'user_confirmation':'reject','barcode' : $stateParams.productId});
      $scope.reportProductText = 'Thank you :)';
      Products.reportAProblem($scope.product,$rootScope.user);
      if(!$scope.product.reported_users){
        $scope.product.reported_users = [];
      }
      $scope.product.reported_users.push({'email':$rootScope.user.email});
    };

    $scope.reportReacted = function(){
      MixpanelService.track('reacted-product',{'user_confirmation':'reject','barcode' : $stateParams.productId});
      $scope.reactedText = 'Reported that you had reaction';
      Products.reportReaction($scope.product,$rootScope.user);
      handleRactionProductForUser($scope.product,$rootScope.user);
    };

    $scope.toggleGroup = function() {
      $scope.show = !this.show;
    };

    $scope.isGroupShown = function() {
      return $scope.show;
    };

    function updateReportButtonText(){
      if($scope.product.reported_users){
        for(var reportedUserIndex = 0; reportedUserIndex < $scope.product.reported_users.length; reportedUserIndex++) {
          if ($scope.product.reported_users[reportedUserIndex].email === $rootScope.user.email) {
            $scope.reportProductText = 'Already reported';
            break;
          }
      }
    }
  }

    function updateReactedButtonText(){
      if($rootScope.user.reactions){
        for(var reactionProductIndex = 0; reactionProductIndex < $rootScope.user.reactions.length; reactionProductIndex++) {
          if ($rootScope.user.reactions[reactionProductIndex]._id === $scope.product._id) {
            $scope.reactedText = "You've reported this product";
            break;
          }
        }
      }
    }

    function foundProductInUserHistory(){
      for(var searchIndex = 0; searchIndex < $rootScope.user.searches.length; searchIndex++){
        if($rootScope.user.searches[searchIndex].barcode_id === $stateParams.productId && $rootScope.user.searches[searchIndex].ingredient_analysis.length > 0) {
          $scope.product = $rootScope.user.searches[searchIndex];
          $scope.handleIsSafe();
          $scope.isNeedToConfrim = false;
          GoogleAnalyticsService.sendEvent('product-details','already_scanned','barcode', $stateParams.productId);
          MixpanelService.track('product-details',{'reference':'already_scanned','barcode_id' : $stateParams.productId});
          return true;
        }
      }
      return false;
    }

    function isProductExistInUserSearch(product){
      for(var searchIndex = 0; searchIndex < $rootScope.user.searches.length; searchIndex++){
        if($rootScope.user.searches[searchIndex].barcode_id === product.barcode_id) {
          return true;
        }
      }
      return false;
    }

    function handleRactionProductForUser(product,user){
      if(user.reactions){
        user.reactions = [];
      }

      var isExist = false;
      for(var i = 0; i < user.reactions.lenght; i++){
        if(user.reactions[i]._id === product._id){
          isExist = true;
          break;
        }
      }

      if(!isExist){
        user.reactions.push(product);
      }
    }

    $scope.addProduct = function(){
      $state.go('tab.add-product',{productId: $stateParams.productId});
    };

    $scope.takeIngredientPic = function(){
    document.addEventListener("deviceready", function () {
      var options = {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };

      $cordovaCamera.getPicture(options).then(function(imageData2) {
        var currDate = new Date();
        var ingredientsImageName = 'ingredients_'+currDate.getTime();
        ImageUploadFactory.uploadImage(imageData2,true,$stateParams.productId,ingredientsImageName).then(function(){console.log('finished - pic2');});
        Products.addMissingIngredients($scope.product,
          CloudinaryConfigs.image_url +'products/' + $stateParams.productId + '/' + ingredientsImageName +'.jpeg',
          $rootScope.user);
        $state.go('tab.home');
      });
    }, false);
  }
})

.controller('AccountCtrl', function($scope,$state,$rootScope,MixpanelService,AuthService) {
  $scope.deleteHistoryText = 'Clear search history';
  $scope.settings = {
    enableFriends: true
  };

  $scope.$on('$ionicView.enter', function() {
    if($rootScope.user.searches && $rootScope.user.searches.length === 0){
      $scope.deleteHistoryText = 'No history to clear';
    }
  });

  $scope.goToAllergies = function(){
    MixpanelService.track('account-button-clicked',{'button name' : 'allergies'});
    $state.go('tab.allergies');
  };

  $scope.clearHistory = function(){
    MixpanelService.track('account-button-clicked',{'button name' : 'clear history'});
    AuthService.clearHistory($rootScope.user);
    $rootScope.user.searches = [];
    $scope.deleteHistoryText = 'Cleared';
  };

  $scope.logout = function(){
    AuthService.logout();
    $state.go('login');
  }

})

.controller('AllergiesCtrl', function($scope,$rootScope,AuthService,Allergies) {
    var needToSave = false;
    $scope.showDelete = false;
    $scope.shouldShowWalkThrough = false;
    Allergies.get().then(function(allergies){
       $scope.allergies  =allergies;
    });

    setTimeout(function(){
      if($rootScope.isFirstTimeInAllergiesTab && $rootScope.user.allergies.length === 0) {
        $scope.shouldShowWalkThrough = true;
      }
      $rootScope.isFirstTimeInAllergiesTab = false;
    },300);

    $scope.addSelectedItemFromRemoteAutocomplete = function(item) {
      if (item && item.originalObject) {
        if(notExist(item)){
          $rootScope.user.allergies.push(item);
          needToSave = true;
        }
      }
    };

    function notExist(allergy){
      for(var allergyIndex = 0; allergyIndex < $rootScope.user.allergies.length; allergyIndex++){
        if(allergy.title === $rootScope.user.allergies[allergyIndex].title){
          return false;
        }
      }
      return true;
    };

    $scope.removeItem = function(allergy,index){
      $rootScope.user.allergies.splice(index,1);
      needToSave = true;
    };

    $scope.$on('$ionicView.leave',function(){
      console.log('leaving');
      if(needToSave) {
        AuthService.updateUser($rootScope.user);
      }
    });
})

.controller('loginCtrl',
  function($scope, $rootScope, $state, AuthService,$ionicLoading,$localStorage,GoogleAnalyticsService,MixpanelService) {

  ionic.Platform.ready(function(){

  });
  $scope.user = {};
  $scope.isError = false;
  $scope.errorMessage = 'We have a bug:( please contact info@typeiv.com';

  $scope.autoLogin = function(){
    if($localStorage.token && $localStorage.email){
      $scope.user.email = $localStorage.email;
      $scope.user.password = 'myPassword123!';
      $ionicLoading.show();
      AuthService.loginByToken($localStorage.token)
        .then(function(response){
          MixpanelService.track('login',{'login-type':'auto-login','email' : $scope.user.email});
          console.log(response);
          // $state.go('tab.account');
          GoogleAnalyticsService.registerUser();

          $state.go('tab.home');
          $ionicLoading.hide();
        },function(err){
          $ionicLoading.hide();
        });

    }
  };
  $scope.autoLogin();
  $scope.login = function() {
    $scope.isError = false;
    console.info('Authentication...');
    $ionicLoading.show();
    AuthService.login($scope.user.email,$scope.user.password)
      //In case of authentication
      .then(function(response){
      console.log(response);
      $ionicLoading.hide();
      MixpanelService.track('login',{'login-type':'login','email' : $scope.user.email});
      GoogleAnalyticsService.registerUser();
      $state.go('tab.home');
      },function(err){
        console.log(err);
        $ionicLoading.hide();
        if(Array.isArray(err.data)){
            $scope.errorMessage = err.data[0].msg;
        }else{
            if(err.data != null) {
              if(err.data.msg) {
                $scope.errorMessage = err.data.msg;
              }
            }else{
              $scope.errorMessage = 'Unable to login';
            }
        }
        $scope.isError = true;
      });
  };
})

.controller('registerCtrl',
  function($scope,AuthService,$state,$ionicLoading,MixpanelService,$rootScope,$localStorage) {
    var date = new Date();
    date.setYear(1991);
    date.setMonth(01,01);
    $scope.user= {
      gender:'female',
      dob:date
    };

    $scope.$watch('user',function(change){
      console.log(change);
      $scope.isDisabled = $scope.validateForm();
    },true);

    $scope.isError = false;
    $scope.errorMessage = 'We have a bug:( please contact info@TypeIV.com';
    $scope.signup = function(){
      $scope.isError = false;
      $ionicLoading.show();
      AuthService.signup($scope.user)
        .then(function(response) {
          console.log(response);
          $ionicLoading.hide();
          MixpanelService.track('signup',{'email' : $scope.user.email});
          $rootScope.isFirstTimeInAllergiesTab = true;
          $rootScope.isFirstTimeInHomeTab = true;
          $state.go('tab.allergies');
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
    };

    $scope.isDisabled = true;
    $scope.isPasswordGood = false;
    // style strength
    $scope.passwordStrength = {
      "float": "left",
      "width": "100%",
      "height": "25px",
      "margin-left": "5px"
  };

  var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{5,})");
  var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{4,})");
  $scope.passwordQuality = '';
  $scope.analyze = function(value){
    if(value==''){
      $scope.passwordStrength["background-color"] = "white";
      $scope.passwordQuality = '';
    }else if(strongRegex.test(value)){
      $scope.passwordStrength["background-color"] = "green";
      $scope.passwordQuality = 'ion-thumbsup balanced';
      $scope.isPasswordGood = true;
    }else if(mediumRegex.test(value)) {
      $scope.passwordStrength["background-color"] = "orange";
      $scope.passwordQuality = 'ion-thumbsup balanced';
      $scope.isPasswordGood = true;
    }else{
      $scope.passwordStrength["background-color"] = "red";
      $scope.passwordQuality = 'ion-thumbsdown assertive';
    }
  };

  $scope.validateForm = function(){
    if($scope.user.email &&
      $scope.user.dob &&
      $scope.user.name &&
      $scope.isPasswordGood &&
      $scope.user.email.indexOf('@') > -1){
      return false
    }
    return true;
  }

  //Auto login
  $scope.autoLogin = function(){
      if($localStorage.token && $localStorage.email){
        $scope.user.email = $localStorage.email;
        $scope.user.password = 'myPassword123!';
        $ionicLoading.show();
        AuthService.loginByToken($localStorage.token)
          .then(function(response){
            MixpanelService.track('login',{'login-type':'auto-login','email' : $scope.user.email});
            console.log(response);
            // $state.go('tab.account');
            $state.go('tab.home');
            $ionicLoading.hide();
            try{
              GoogleAnalyticsService.registerUser();
            }catch(err){
              console.log(err);
            }
          },function(err){
            $ionicLoading.hide();
          });

      }
    };
  $scope.autoLogin();
})

.controller('AddProductCtrl',
  function($scope,
           $state,
           $cordovaCamera,
           ImageUploadFactory,
           $stateParams,$ionicLoading,
           $timeout,Products,
           CloudinaryConfigs,$rootScope){
    $scope.barcodeId = $stateParams.productId;
    $scope.takePics = function(){
      document.addEventListener("deviceready", function () {
        var options = {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 500,
          targetHeight: 500,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false,
          correctOrientation:true
        };

        $ionicLoading.show({template: 'Take a picture of the item itself'});
        $timeout(function(){
          $ionicLoading.hide();
          $cordovaCamera.getPicture(options).then(function(imageData1) {
            // var image = document.getElementById('myImage');
            // image.src = "data:image/jpeg;base64," + imageData;
            var currDate = new Date();
            var productImageName = 'product_'+currDate.getTime();
            ImageUploadFactory.uploadImage(imageData1,false,$scope.barcodeId,productImageName).then(function(){console.log('finished - pic1');});
            $ionicLoading.show({template: 'And now the ingredients'});
            $timeout(function(){
              $ionicLoading.hide();
              $cordovaCamera.getPicture(options).then(function(imageData2) {
                var ingredientsImageName = 'ingredients'+currDate.getTime();
                ImageUploadFactory.uploadImage(imageData2,true,$scope.barcodeId,ingredientsImageName).then(function(){console.log('finished - pic2');});
                Products.addManualProduct(
                  CloudinaryConfigs.image_url +'products/' + $scope.barcodeId + '/'+ productImageName + '.jpeg',
                  CloudinaryConfigs.image_url +'products/' + $scope.barcodeId + '/'+ ingredientsImageName + '.jpeg',
                  $scope.barcodeId,
                  $rootScope.user);
                  $state.go('tab.home');
              });
            }, 2500);
          }, function(err) {
            // error
            console.log(err);
          });
        }, 2500);
      }, false);
    }
});
