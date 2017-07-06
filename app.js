//Module
var app = angular.module('ComparadorUsuarios', []);

//Services
app.service('pointsService', function($http, $q) {
    /*Funcao para retornar a pontuacao de um determinado usuario
        1 Follower = 2 pontos
        1 Star = 5 pontos
    */
    this.getPoints = function(userURL, repLength, followers) {
        //Recebe a url a ser acessada
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
                showError(error);
                return error;
            });
    }

    //Funcao para atualizar campo vencedor de um determinado objeto usuario
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
    //Funcao para GET de apenas um usuario
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
                        })
                        .catch(function(error) {
                            console.error(error);
                            showError(error);
                            return error;
                        });
                }
            })
            .catch(function(error) {
                console.error(error);
                showError(error);
                return error;
            });
    }

    //Funcao para GET de todos os usuarios, apos receber usuarios, eh calculado quem eh o vencedor
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
                                })
                                .catch(function(error) {
                                    console.error(error);
                                    showError(error);
                                    return error;
                                });
                        });
                    }
                })
                .catch(function(error) {
                    console.error(error);
                    showError(error);
                    return error;
                });
        });
        deferred.resolve(users);
        return deferred.promise;
    }

});

//Controller
app.controller('comparadorUsuariosController', function($scope, $http, $q, userService) {
    $scope.formUsers = {};
    $scope.users = [];
    $scope.winners = 0;
    $scope.erroReq = "";

    //Funcao de reinicializacao de valores
    reset = function(){
        $scope.users = [];
        $scope.erroReq = "";
        $scope.winners = 0;
    }

    showError = function(error){
        reset();
        $scope.erroReq = error.messageStatus;
    }

    //Exibe vencedor
    $scope.showWinner = function(users, currentUser){
        var deferred = $q.defer();
        var winners = 0;
        var isSame = true;
        angular.forEach(users, function(user, index) {
            if(user.vencedor)
                winners++;
            if(user.id != currentUser.id)
                isSame = false;
        });

        if(isSame && users.length > 1)
            return "USUÁRIO REPETIDO";
        else if(winners > 1)
            return "EMPATE";
        else if(winners === 1 && currentUser.vencedor)
            return currentUser.login + " VENCEU";
        else
            return "";
    }

    //Funcao submit do formulario, no qual chama getUsers e calcula quem eh o vencedor
    $scope.compareUsers = function(isValid) {
        if(isValid) {
            reset();
            userService.getUsers([$scope.user1, $scope.user2])
                .then(function (users) {
                    $scope.users = users;
                })
                .catch(function(error) {
                    console.error(error);
                    showError(error);
                    $scope.erroReq = error;
                });
        }else{
            $scope.erroReq = "Dados dos campos são inválidos!";
        }
    }
});