angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Products', function($http,
                              $q,
                              $rootScope,
                              ApiEndpoint,GeoService) {
  // Some fake testing data
  var product = {};

  var config = {
    headers: {
      "Authorization": 'Bearer ' + $rootScope.token,
      "Content-Type": 'application/json'
    }
  };

  return {
    get: function(barcodeId) {
      var data = {};
      return GeoService.getCurrentLocation().then(function(position){
        console.log(position);
        data.position = position;
        return $http.post(ApiEndpoint.url + 'product/' + barcodeId,data,config).then(function(response){
          if(response.status == 200){
            return response.data;
          }
        });
      });
    },
    reportAProblem: function(product,user) {
      var data = {
        product : product,
        user : user
      };
      return $http.post(ApiEndpoint.url + 'report/product',data,config).then(function(response){
        if(response.status == 200){
          return response.data;
        }
      });
    },
    reportReaction: function(product,user) {
      var data = {
        product : product,
        user : user
      };
      return GeoService.getCurrentLocation().then(function(position) {
        data.position = position;
         return $http.post(ApiEndpoint.url + 'react/product', data, config).then(function (response) {
          if (response.status == 200) {
            return response.data;
          }
        });
      });
    },
    addManualProduct:function(imageUrl,IngredientsUrl,barcodeId,user){
      var data = {
        product_image_url : imageUrl,
        ingredients_image_url : IngredientsUrl,
        barcode_id : barcodeId,
        user : user
      };
      return GeoService.getCurrentLocation().then(function(position) {
        data.location = position;
        return $http.post(ApiEndpoint.url + 'add/product', data, config).then(function (response) {
          if (response.status == 200) {
            return response.data;
          }
        });
      });
    },
    addMissingIngredients:function(product,IngredientsUrl,user){
      var data = {
        product:product,
        product_image_url : product.image_url,
        ingredients_image_url : IngredientsUrl,
        barcode_id : product.barcodeId,
        user : user
      };
      return GeoService.getCurrentLocation().then(function(position) {
        data.location = position;
        return $http.post(ApiEndpoint.url + 'add/product', data, config).then(function (response) {
          if (response.status == 200) {
            return response.data;
          }
        });
      });
    }
  };
})

.service('AuthService', function($q,
                                 $http,
                                 $rootScope,
                                 $ionicLoading,
                                 ApiEndpoint,
                                 $localStorage,
                                 PushNotificationService,
                                 $ionicUser,
                                 $ionicAuth,GeoService,MixpanelService){
  var service = this;
  service.login = function ($email, $password) {
      var data = {
        email: $email,
        password: $password
      };

      var deferred = $q.defer();
      $http.post(ApiEndpoint.url + 'login', data)
        .then(function (response) {
          if (response.data.token) {
            $rootScope.token = response.data.token;
            $rootScope.user = response.data.user;
            $localStorage.token = $rootScope.token;
            $localStorage.email = $rootScope.user.email;
            $ionicUser.email = $rootScope.user.email
          }
          handleIonicUser($rootScope.user);

          deferred.resolve(response.data);
        }, function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    };

  service.loginByToken = function (token) {
      var deferred = $q.defer();
      var config = {
        headers: {
          "Authorization": 'Bearer ' + token
        }
      };
      $http.post(ApiEndpoint.url + 'tokenlogin', {}, config)
        .then(function (response) {
          if (response.data.token) {
            $rootScope.token = response.data.token;
            $rootScope.user = response.data.user;
            $localStorage.token = $rootScope.token;
            $localStorage.email = $rootScope.user.email;
          }
          handleIonicUser($rootScope.user);
          GeoService.getCurrentLocation();
          deferred.resolve(response.data);
        }, function (err) {
          deferred.reject(err);
        });

      return deferred.promise;
    };
  service.signup =function (user) {
      var deferred = $q.defer();
      $http.post(ApiEndpoint.url + 'signup', user)
        .then(function (response) {
          if (response.data.token) {
            $rootScope.token = response.data.token;
            $rootScope.user = response.data.user;
            $localStorage.token = $rootScope.token;
            $localStorage.email = $rootScope.user.email;
          }
          handleIonicUser($rootScope.user);
          deferred.resolve(response.data);
        }, function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    };
  service.logout = function(){
    delete $localStorage.token;
    delete $localStorage.email;
  };
  service.updateUser = function (user) {
      var deferred = $q.defer();
      var config = {
        headers: {
          "Authorization": 'Bearer ' + $rootScope.token
        }
      };
      $http.put(ApiEndpoint.url + 'account', user, config)
        .then(function (response) {
          deferred.resolve(response.data);
        }, function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    };
  service.clearHistory = function (user) {
      var deferred = $q.defer();
      var config = {
        headers: {
          "Authorization": 'Bearer ' + $rootScope.token
        }
      };
      $http.put(ApiEndpoint.url + 'clear/history', user, config)
        .then(function (response) {
          deferred.resolve(response.data);
        }, function (err) {
          deferred.reject(err);
        });
      return deferred.promise;
    };

  function handleIonicUser(user){
    var details = {'email':user.email,'password': user.email};
    if(!user.ionic_id){
      $ionicAuth.signup(details).then(function(){
        $ionicAuth.login('basic', details).then(function() {
          handlePushToken();
        });
      },function(err){
        //this in case the user already logged in, but we didn't save the ionic id in our DB
        $ionicAuth.login('basic', details).then(function(){
          handlePushToken();
        });
      });
    }else {
      $ionicAuth.login('basic', details).then(function(){
        handlePushToken();
      });
    }
  }

  function handlePushToken() {
    MixpanelService.setUser($rootScope.user);
    PushNotificationService.register().then(function (token) {
      console.log("return value is " + token);
      $rootScope.user.push_token = token.token;
      if(!$rootScope.user.ionic_id) {
        $rootScope.user.ionic_id = $ionicUser.id;
      }
      service.updateUser($rootScope.user);
    },function(err){
      if(!$rootScope.user.ionic_id) {
        $rootScope.user.ionic_id = $ionicUser.id;
      }
      service.updateUser($rootScope.user);
    });
  }

  return service;
})

.service('Allergies', function($http,$q,ApiEndpoint){
  var allergies = [];
  function loadAllergies() {
    var deferred = $q.defer();
    if(allergies.length == 0) {
      var url = ApiEndpoint.url + 'allergies';
      $http.get(url).then(function (response) {
        if (response.status == 200) {
          deferred.resolve(response.data);
        }
      });
    }else{
      deferred.resolve();
      console.log('already loaded');
    }
    return deferred.promise;
  }

  loadAllergies().then(function(data){
    if(data) {
      allergies = data;
    }
  });
  return {
    get: function(){
     return loadAllergies();
    }
  }
})

.service('GoogleAnalyticsService', function($rootScope){
  return {
    init : function(){
      if (typeof analytics !== 'undefined'){
        analytics.startTrackerWithId('UA-92906138-1');
      }
      else
      {
        console.log("Google Analytics plugin could not be loaded.")
      }
    },
    registerUser:function(){
      if (typeof analytics !== 'undefined'){
        analytics.setUserId($rootScope.user.email);
      }
      else
      {
        console.log("Google Analytics plugin could not be loaded.")
      }
    },
    sendEvent:function(category, action, label, value){
      if (typeof analytics !== 'undefined'){
        analytics.trackEvent(category, action, label, value);
      }
    },
    trackView:function(viewName){
      if (typeof analytics !== 'undefined'){
        analytics.trackView(viewName);
      }
    }
  }
})

.service('PushNotificationService',function($ionicPush,$q){
  return {
    register: function () {
      var deferred = $q.defer();
      $ionicPush.register().then(function (t) {
        return $ionicPush.saveToken(t);
      }).then(function (t) {
        console.log('Token saved: ' + t.token);
        deferred.resolve(t);
      },function(err){
        console.log('Token saved err: ', err);
        deferred.reject(err);
      });
      return deferred.promise;
    }
  }
})

.service('GeoService', function($cordovaGeolocation,$q) {
  var posOptions = {timeout: 10000, enableHighAccuracy: false};
  return {
    getCurrentLocation: function() {
      var deferred = $q.defer();
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          console.log('ziv.. the locations are lat: ' + lat + ' long: ' + long);
          deferred.resolve({lat:lat,long:long});
        }, function (err) {
          console.log(err);
          deferred.resolve(err);
        });
      return deferred.promise;
    }
  }

  // var watchOptions = {
  //   timeout : 3000,
  //   enableHighAccuracy: false // may cause errors if true
  // };

  // var watch = $cordovaGeolocation.watchPosition(watchOptions);
  // watch.then(
  //   null,
  //   function(err) {
  //     // error
  //   },
  //   function(position) {
  //     var lat  = position.coords.latitude
  //     var long = position.coords.longitude
  //   });
  //
  //
  // watch.clearWatch();
  // // OR
  // $cordovaGeolocation.clearWatch(watch)
  //   .then(function(result) {
  //     // success
  //   }, function (error) {
  //     // error
  //   });
})

.service('MixpanelService', function(){
    return {
      init : function(){
        if (typeof mixpanel !== 'undefined'){
          mixpanel.init('3261e3a6a9b99054982e061e29221232');
        }
        else
        {
          console.log("Mixpanel plugin could not be loaded.")
        }
      },
      track:function(eventName, eventProperties,onSuccess,onError){
        if (typeof mixpanel !== 'undefined'){
          mixpanel.track(eventName, eventProperties,onSuccess,onError);
        }
      },
      setUser:function(user){
        if (typeof mixpanel !== 'undefined'){
          mixpanel.identify(user.id,function(){},function(){});
          mixpanel.people.set({
            email:user.email,
            name:user.name
          });
        }
      }
    }
  })

//Templates
.factory('CloudinaryConfigs', function(){
  this.upload_preset='pzhlnrnu';
  this.api_url = 'https://api.cloudinary.com/api/v1_1/typeiv/image/upload/';
  this.image_url = 'http://res.cloudinary.com/typeiv/image/upload/v1501142731/';
  return this;
})

.service('BlankService', function(){

})

.directive('imageonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var selfAttrs = attrs;
      element.bind('load', function() {
        console.log('image is loaded');
      });
      element.bind('error', function(){
        scope.$apply(attrs.src='/img/no_image.png');
        console.log('image could not be loaded');
      });
    }
  };
})

.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
          attrs.$set('ng-src', attrs.errSrc);
          angular.element(this).attr("src", attrs.errSrc);
        }
      });
    }
  }
})

.factory('ImageUploadFactory', function ($q, $ionicLoading, $cordovaFileTransfer, CloudinaryConfigs) {
  return {
    uploadImage: function (imageURI,showLoading,barcodeId,fileName) {
      console.log('start upload image.');
      var deferred = $q.defer();

      uploadFile();

      function uploadFile() {
        if(showLoading) {
          $ionicLoading.show({template: 'Uploading image...'});
        }
        // Add the Cloudinary "upload preset" name to the headers
        var uploadOptions = {
          params : {
            'upload_preset': CloudinaryConfigs.upload_preset,
            'public_id': 'products/' + barcodeId + '/' + fileName
          }
        };
        $cordovaFileTransfer
        // Your Cloudinary URL will go here
          .upload(CloudinaryConfigs.api_url, imageURI, uploadOptions)

          .then(function(result) {
            if(showLoading) {
              // Let the user know the upload is completed
              $ionicLoading.show({template: 'Thanks.. this product will be there soon', duration: 2000});
            }
            var response = JSON.parse(decodeURIComponent(result.response));
            deferred.resolve(response);
          }, function(err) {
            if(showLoading) {
              // Uh oh!
              $ionicLoading.show({template: 'Failed.', duration: 3000});
            }
            deferred.reject(err);
          }, function (progress) {

          });
      }
      return deferred.promise;
    }
  }
});
