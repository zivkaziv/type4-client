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

.factory('Products',['$http','$q', function($http,$q,$rootScope) {
  // Some fake testing data
  var product = {};

  var config = {
    headers: {
      "Authorization": 'Bearer ' + $rootScope.token
    }};

  return {
    get: function(barcodeId) {
      var url = 'https://type4.herokuapp.com/product/';
      return $http.get(url + barcodeId,config).then(function(response){
        if(response.status == 200){
          return response.data;
        }
      });
    }
  };
}])

.service('AuthService', function($q, $http, $rootScope, $ionicLoading, ApiEndpoint,$localStorage,Allergies){
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
            $localStorage.token = $rootScope.token;
            $localStorage.email = $rootScope.user.email;
          }
          deferred.resolve(response.data);
        },function(err){
          deferred.reject(err);
        });

      return deferred.promise;
    },

    loginByToken: function(token){
      var deferred = $q.defer();
      var config = {
        headers: {
        "Authorization": 'Bearer ' + token
      }};
      $http.post(ApiEndpoint.url+'tokenlogin', {},config)
        .then(function(response){
          if(response.data.token) {
            $rootScope.token = response.data.token;
            $rootScope.user = response.data.user;
            $localStorage.token = $rootScope.token;
            $localStorage.email = $rootScope.user.email;
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
    },

    updateUser:function(user){
      var deferred = $q.defer();
      var config = {
        headers: {
          "Authorization": 'Bearer ' + $rootScope.token
        }};
      $http.put(ApiEndpoint.url+'account', user,config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(err){
          deferred.reject(err);
        });
      return deferred.promise;
    }
  }

})

.service('Allergies', function($http,$q){
  var allergies = [];
  function loadAllergies() {
    var deferred = $q.defer();
    if(allergies.length == 0) {
      var url = 'https://type4.herokuapp.com/allergies';
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
      return allergies;
    }
  }
})

//Templates
.factory('BlankFactory', function(){

})

.service('BlankService', function(){

});
