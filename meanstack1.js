
var app = angular.module('myapp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: './public/main.html',
        controller: 'mainController'
    })

        .when('/login', {
            templateUrl: './public/login.html',
            controller: 'loginController'
        })


        .when('/registration', {

            templateUrl: './public/registration.html',
            controller: 'registrationController'
        })


        .when('/profile', {

            templateUrl: './public/profile.html',
            controller: 'profileController',
            resolve: [
                "authService", function (authService) {
                    return authService.isLoggedIn();
                }
            ]
        })

        .when('/messages', {

            templateUrl: './public/messages.html',
            controller: 'messagesController',
            resolve: [
                "authService", function (authService) {
                    return authService.isLoggedIn();
                }
            ]
        })

        .when('/detailmsg/:id', {
            templateUrl: './public/detailmsg.html',
            controller: 'detailmsgController',
            resolve: [
                "authService", function (authService) {
                    return authService.isLoggedIn();
                }
            ]

        })

        .when('/logout', {

            templateUrl: './public/main.html',
            controller: 'logoutController'
        })


});




//main--

 app.controller('mainController', function ($scope) {

    $scope.$emit("login",{});
 })


app.controller("indexController", function ($scope) {

   

    $scope.$on('login', (event, obj) => {

        $scope.login = true;
        
    });


    $scope.$on('logout', (event, obj) => {
        $scope.login = false;
       
    });

    


});




//registration-

app.controller('registrationController', function ($scope, $http, $location, $rootScope) {

    $scope.$emit("login", {})

    $scope.register = function () {

        $http.post('http://localhost:3000/register', { registerform: $scope.registerform })
        .then(function (resp) {
                if (resp.data == true) {
                    $location.path('/login')
                }
                else {
                    alert("registration failed");
                }
            })
            .catch(() => {
                console.log('registration request failed');
            })
    };

});





//login-

app.controller('loginController', function ($scope, $http, $location, $rootScope) {

    
    $scope.$emit("login", {});
    //console.log($scope.$emit("logout", {}));
    $scope.login = function () {

        $http.post('http://localhost:3000/login', { loginform: $scope.loginform })
            .then(function (resp) {

                if (resp.data) {
                    $location.path('/profile');
                    $rootScope.user = resp.data.username;
                    sessionStorage.loggedin = true;
                    sessionStorage.user = resp.data.username;
                }
                else {
                    $location.path('/registration');
                    alert('incorrect details');
                }
            })
            .catch(() => {
                console.log('login request failed');
            });
    };

});





//profile

app.controller('profileController', function ($scope, $http, $location, $rootScope) {

    
    $scope.$emit("logout", {});

    if (sessionStorage.user) {

        var url = "http://localhost:3000/users/" + sessionStorage.user;

        $http.get(url).then(function (resp) {

            //console.log(resp.data);

            $scope.updateform = resp.data;
        });
    }

    $scope.update = function () {

        $http.post('http://localhost:3000/update', {
            username: $scope.updateform.username,
            password: $scope.updateform.password,
            firstname: $scope.updateform.firstname,
            lastname: $scope.updateform.lastname,
            email: $scope.updateform.email,
            location: $scope.updateform.location,
            phone: $scope.updateform.phone
        })
            .then(function (resp) {

                if (resp) {
                    $scope.updateform = resp.data;
                    alert('successfully updated');
                    $location.path('/messages');
                }
                else {
                    alert('not updated');
                }
            })
            .catch(() => {
                alert('request failed');
            });
    };

});





//messages--

app.controller('messagesController', function ($scope, $http,$location) {

    
    $scope.$emit("logout", {});

    
    var url = "http://localhost:3000/messages/" + sessionStorage.user;

    $http.get(url)
        .then(function (resp) {

            //console.log(resp.data);
            $scope.messages = resp.data;

        }).catch((err) => {

            alert('messages not exist');
            console.log(err);
        });

        //details function
        $scope.details=function(event){

            var id=event.target.id;
            $location.path(`/detailmsg/${id}`);
        }

});



//details of message-

app.controller('detailmsgController', function ($scope, $http, $routeParams, $location, $rootScope) {


    $scope.$emit("logout", {});
    //console.log($routeParams.id)

    $http.get(`http://localhost:3000/detailmsgs/${$routeParams.id}`)
        .then(function (res) {
           //console.log(res.data);
           if(res.data[0].favourite ==true){
               //console.log(res.data[0].favourite);
            $scope.favtrue = true;
          }else{
              //console.log(res.data.favourite);
            $scope.favtrue = false;
          }

            $scope.messages = res.data[0];
            //console.log($scope.messages);

        }).catch(function (err) {
            console.log(err);
        });



    //favourite-
$scope.favourite=function(event){
    
    // var id = event.target.id;
    //console.log(id);
    $http.get(`http://localhost:3000/favourite/${$routeParams.id}`)
    .then(function(res){
      if(res.data){
          console.log(res.data);
        if(res.data.favourite ==true){
          $scope.favtrue = true;
        }else{
          $scope.favtrue = false;
        }
        $scope.message = res.data;
        //console.log($scope.message);
      }
    }).catch((err)=>{
      console.log(err);
    })

  }




    //delete message
    $scope.delete = function (event) {
        var id = event.target.id;
        console.log(id);
        
        $http.get(`http://localhost:3000/delete/${$routeParams.id}`)
            .then(function (resp) {

                if (resp.data) {
                    $location.url('/messages');
                }
            }).catch(function (err) {
                console.log(err);
            });

    }

    //reply

    $scope.replyOn = false;
    $scope.reply = function (event) {

        $scope.replyOn = true;
        //console.log("reply works");
    }



    $scope.sendmessage = function (event) {

       //console.log($routeParams.id);

        $http.post(`http://localhost:3000/reply/${$routeParams.id}`, { reply: $scope.newreply})
            .then(function (resp) {

                //console.log(resp);
                if (resp.data) {
                    alert('message sent');

                    if(resp.data.favourite==true){
                        $scope.favtrue=true;
                    }else{
                        $scope.favtrue=false;
                    }

                    } else {
                        alert('reply not sent')
                }

                $scope.messages=resp.data;
                console.log($scope.messages);
            }).catch((err) => {
                console.log(err);
            });

    };

});





//logout---
app.controller('logoutController', function ($location) {

    localStorage.isLoggedIn = false;
    sessionStorage.loggedin=false;
    sessionStorage.user=undefined;
    alert("logged out");

    $location.path('/login');

});



//using service-


app.factory('authService',function($location){

    return {

        isLoggedIn:function(){
            if(sessionStorage.loggedin=="false"){
                $location.url("/login");
            }
        }
    }

});









