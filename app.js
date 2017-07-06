//Module
var app = angular.module('ComparadorUsuarios', []);

//Services
app.service('pointsService', function($http, $q) {
    this.getPoints = function(userURL, repLength, followers) {
        var repURL = userURL+"/repos?per_page="+repLength;
        return $http.get(repURL)
            .then(function(response) {
                if(response.status === 200){
                    var points = followers*2;
                    angular.forEach(response.data, function(rep, index) {
                        points += parseInt(rep.stargazers_count)*5;
                    });
                    return points;
                }
            }, function(error) {
                console.log(error);
            });
    }

    this.isWinner = function(users, currentUser) {
        var deferred = $q.defer();
        var currentUserPoints = currentUser.points;
        var isWinner = true;
        angular.forEach(users, function(user, index){
            if(currentUserPoints < user.points)
                isWinner = false;
        });
        deferred.resolve(isWinner);
        return deferred.promise;
    };
});

app.service('userService', function($http, $q, pointsService) {
    this.getUser = function(username, index) {
        var url = "https://api.github.com/users/" + username;
        var user = {};
        return $http.get(url)
            .then(function(response) {
                if(response.status === 200){
                    return pointsService.getPoints(url, response.data.public_repos, response.data.followers)
                        .then(function(points) {
                            user = {
                                id: response.data.id,
                                name: response.data.name,
                                login: response.data.login,
                                followers: response.data.followers,
                                avatar_url: response.data.avatar_url,
                                points: points,
                                vencedor: false
                            };
                            return user;
                        }, function(error) {
                            console.log(error);
                        });
                }
            }, function(error) {
                console.log(error);
            });
    }

    
    var self = this;
    this.getUsers = function(usernames) {
        var deferred = $q.defer();
        var users = [];
        angular.forEach(usernames, function(username, index) {
            self.getUser(username, index)
                .then(function(response) {
                    users.push(response);
                    if(users.length == usernames.length){
                        angular.forEach(users, function(user, index) {
                            pointsService.isWinner(users, user)
                                .then(function(response) {
                                    user.vencedor = response;
                                }, function(error) {
                                    $scope.reset();
                                });
                        });
                    }
                }, function(error) {
                    console.log(error);
                });
        });
        deferred.resolve(users);
        return deferred.promise;
    }
});

//Controller
app.controller('comparadorUsuariosController', function($scope, $http, userService) {
    $scope.formUsers = {};
    $scope.users = [];
    $scope.validacao = '^[a-zA-Z ]+$';
    $scope.erroReq = "";

    $scope.reset = function(){
        $scope.users = [];
        $scope.erroReq = "";
    }

    $scope.compareUsers = function(isValid) {
        if(isValid) {
            $scope.reset();
            userService.getUsers([$scope.user1, $scope.user2])
                .then(function (response) {
                    $scope.users = response;
                }, function(error) {
                    $scope.reset();
                });
        }else{
            $scope.erroReq = "Dados dos campos são inválidos!";
        }
    }
});