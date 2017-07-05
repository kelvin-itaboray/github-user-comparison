// App module
var app = angular.module('ComparadorUsuarios', []);

app.controller('comparadorUsuariosController', function($scope, $http) {
    $scope.formUsers = {};
    $scope.usersInfo = {};
    $scope.texto = '^[a-zA-Z ]+$';
    $scope.numerico = '^[0-9]+$';
    $scope.erroReq = "";

    $scope.compare = function(isValid) {
        if(isValid) {
            var url = "https://api.github.com/users/";
            var reqUser1 = url + $scope.formUsers.user1.modelValue;
            var reqUser2 = url + $scope.formUsers.user2.modelValue;
            $scope.erroReq = "";
            $http.get(reqUser1)
                .then(function (response) {
                    $scope.usersInfo = response.data;
                });
        }else{
            $scope.erroReq = "Dados dos campos são inválidos!";
        }
    }
});