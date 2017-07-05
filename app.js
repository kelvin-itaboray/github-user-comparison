// App module
var app = angular.module('ComparadorUsuarios', []);

app.controller('comparadorUsuariosController', function($scope, $http) {
    $scope.formUsers = {};
    $scope.usersInfo = [];
    $scope.validacao = '^[a-zA-Z ]+$';
    $scope.erroReq = "";

    $scope.getUser = function(url) {
        $http.get(url)
                .then(function (response) {
                    if(response.status === 200)
                        $scope.usersInfo.push(response.data);
                }, function(response) {
                    $scope.erroReq = "Dados de usuário inválidos!";
                    $scope.usersInfo = {};
                });
    }

    $scope.getRep = function(url) {
    }

    $scope.compareUsers = function(isValid) {
        if(isValid) {
            $scope.usersInfo = [];
            $scope.erroReq = "";
            var url = "https://api.github.com/users/";
            var reqUser1 = url + $scope.user1;
            var reqUser2 = url + $scope.user2;
            $scope.getUser(reqUser1);
            $scope.getUser(reqUser2);
        }else{
            $scope.erroReq = "Dados dos campos são inválidos!";
        }
    }

    $scope.verifyWinner = function(users){

    }
});