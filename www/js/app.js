

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter',
  ['ionic',
    'ionic.native',
    'starter.controllers',
    'starter.services',
    'ngCordova',
    'ngStorage',
    'ionic-zoom-view',
    'angucomplete-alt',
    'ionic.cloud',
    'ng-walkthrough'
  ])

  .constant('ApiEndpoint', {
    url: 'https://typeiv.herokuapp.com/'
    // url: 'http://localhost:8000/'
  })

  .config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'loginCtrl'
      })

      .state('login-v2', {
        url: '/login2',
        templateUrl: 'templates/login-v2.html',
        controller: 'registerCtrl'
      })

      .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'registerCtrl'
      })

      // Each tab has its own nav history stack:
      .state('tab.home', {
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'templates/tab-home.html',
            controller: 'HomeCtrl'
          }
        }
      })
      .state('tab.product-details-home', {
        url: '/home/product/:productId',
        views: {
          'tab-home': {
            templateUrl: 'templates/product-details-v2.html',
            controller: 'ProductDetailCtrl'
          }
        }
      })

      .state('tab.productscan', {
        url: '/scan',
        views: {
          'tab-product-scan': {
            templateUrl: 'templates/tab-product-scan.html',
            controller: 'ScanProductCtrl'
          }
        }
      })

      .state('tab.product-details', {
        url: '/product/:productId',
        views: {
          'tab-product-scan': {
            templateUrl: 'templates/product-details-v2.html',
            controller: 'ProductDetailCtrl'
          }
        }
      })

      .state('tab.add-product', {
        url: '/addproduct/:productId',
        views: {
          'tab-home': {
            templateUrl: 'templates/add-product.html',
            controller: 'AddProductCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('tab.allergies-menu', {
        url: '/allergies',
        views: {
          'tab-allergies': {
            templateUrl: 'templates/tab-allergies.html',
            controller: 'AllergiesCtrl'
          }
        }
      })

      .state('tab.allergies', {
        url: '/account/allergies',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-allergies.html',
            controller: 'AllergiesCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login2');
  })

  .config(function($ionicCloudProvider) {
    $ionicCloudProvider.init({
      "core": {//App ID in https://apps.ionic.io
        "app_id": "435a0266"
      },
      "push": {//Notification service in ionic https://apps.ionic.io
        "sender_id": "637673090836",
        "pluginConfig": {
          "ios": {
            "badge": true,
            "sound": true
          },
          "android": {
            "iconColor": "#343434"
          }
        }
      }
    });
  })

  .run(function($ionicPlatform,MixpanelService) {
    $ionicPlatform.ready(function() {
      MixpanelService.init();
    });
  })

  //run with deploy
  .run(function($ionicDeploy,
                $ionicPlatform,
                GoogleAnalyticsService,
                $rootScope,
                $state,
                $ionicPopup,
                $cordovaDeeplinks,
                MixpanelService) {
    var initApp = function () {
      console.log('Checking if we need to download new version');
      $ionicDeploy.check().then(function (response) {
          // response will be true/false
          if (response) {
            console.log('Downloading update...');
            // Download the updates
            $ionicDeploy.download().then(function () {
              console.log('Extracting..');
              return $ionicDeploy.extract();
            }).then(function () {
              $ionicPopup.show({
                title: 'Update available',
                subTitle: 'An update was just downloaded. Would you like to restart your app to use the latest features?',
                buttons: [
                  {text: 'Not now'},
                  {
                    text: 'Restart',
                    onTap: function (e) {
                      console.log('loading the new app..');
                      $ionicDeploy.load();
                      e.stopPropagation();
                    }
                  }
                ]
              });
              // return $ionicDeploy.load();
            });
          } else {
            console.log('No need to download ' + response);
          }
        },
        function (error) {
          // Error checking for updates
          console.log('Error checking for updates ' + error);
        });

      $rootScope.$on('$stateChangeSuccess', function () {
        GoogleAnalyticsService.init();
        GoogleAnalyticsService.trackView($state.current.name);
      });
    };

    $ionicPlatform.ready(function() {

      //Deeplinking
      $ionicPlatform.ready(function() {
        $cordovaDeeplinks.route({
          '/login': {
            target: 'login',
            parent: 'login'
          }
        }).subscribe(function(match) {
          $timeout(function() {
            $state.go(match.$route.parent, match.$args);
          }, 300);
        }, function(nomatch) {
          console.warn('No match', nomatch);
        });
      });

      MixpanelService.track("Device is ready to be tracked");

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }

      if(navigator.connection && navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device."
        })
          .then(function(result) {
            if(!result) {
              ionic.Platform.exitApp();
            }else{
              initApp();
            }
          });
      }else{
        initApp();
      }
    });
  });
