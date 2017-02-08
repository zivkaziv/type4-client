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

.service('LoginService', function($q) {
  return {
    loginUser: function(name, pw) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      if (name == 'user' && pw == 'secret') {
        deferred.resolve('Welcome ' + name + '!');
      } else {
        deferred.reject('Wrong credentials.');
      }
      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      };
      return promise;
    }
  }
})

.factory('fireBaseData', function($firebase) {
  var ref = new Firebase("https://projectId.firebaseio.com/"),
    refCart = new Firebase("https://projectId.firebaseio.com/cart"),
    refUser = new Firebase("https://projectId.firebaseio.com/users"),
    refCategory = new Firebase("https://projectId.firebaseio.com/category"),
    refOrder = new Firebase("https://projectId.firebaseio.com/orders"),
    refFeatured = new Firebase("https://projectId.firebaseio.com/featured"),
    refMenu = new Firebase("https://projectId.firebaseio.com/menu");
  return {
    ref: function() {
      return ref;
    },
    refCart: function() {
      return refCart;
    },
    refUser: function() {
      return refUser;
    },
    refCategory: function() {
      return refCategory;
    },
    refOrder: function() {
      return refOrder;
    },
    refFeatured: function() {
      return refFeatured;
    },
    refMenu: function() {
      return refMenu;
    }
  }
})

.factory('sharedUtils',['$ionicLoading','$ionicPopup', function($ionicLoading,$ionicPopup){




  var functionObj={};

  functionObj.showLoading=function(){
    $ionicLoading.show({
      content: '<i class=" ion-loading-c"></i> ', // The text to display in the loading indicator
      animation: 'fade-in', // The animation to use
      showBackdrop: true, // Will a dark overlay or backdrop cover the entire view
      maxWidth: 200, // The maximum width of the loading indicator. Text will be wrapped if longer than maxWidth
      showDelay: 0 // The delay in showing the indicator
    });
  };
  functionObj.hideLoading=function(){
    $ionicLoading.hide();
  };


  functionObj.showAlert = function(title,message) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message
    });
  };

  return functionObj;

}])

.factory('Products',['$http','$q', function($http,$q) {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var product = {};

  return {
    get: function(barcodeId) {
      var url = 'https://type4.herokuapp.com/product/';
      return $http.get(url + barcodeId).then(function(response){
        if(response.status == 200){
          return response.data;
        }
      });
    }
  };
}])

.service('AuthService', function($q, $http, $rootScope, $ionicLoading, ApiEndpoint){
  return {
    login : function($email, $password) {
      var data = {
        email: $email,
        password: $password
      };

      var deferred = $q.defer();
      $http.post(ApiEndpoint.url+'login', data)
        .then(function(response){
          if(response.data.token) {
            $rootScope.token = response.data.token;
            $rootScope.user = response.data.user;
          }
          deferred.resolve(response.data);
        },function(err){
          deferred.reject(err);
        });

      return deferred.promise;
    },

    signup:function(user){
      var deferred = $q.defer();
      $http.post(ApiEndpoint.url+'signup', user)
        .then(function(response){
          if(response.data.token) {
            $rootScope.token = response.data.token;
            $rootScope.user = response.data.user;
          }
          deferred.resolve(response.data);
        },function(err){
          deferred.reject(err);
        });
      return deferred.promise;
    }
  }
})


//Templates
.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}]);
