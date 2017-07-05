//Module
var app = angular.module('ComparadorUsuarios', []);

//Controller
app.controller('comparadorUsuariosController', function($scope, $http) {
    $scope.formUsers = {};
    $scope.users = [];
    $scope.validacao = '^[a-zA-Z ]+$';
    $scope.erroReq = "";

    $scope.reset = function(){
        $scope.users = [];
    }

    $scope.getRep = function(userURL, index, repLength, points) {
        var repURL = userURL+"/repos?per_page="+repLength;
        $http.get(repURL)
                .then(function(response) {
                    if(response.status === 200){
                        angular.forEach(response.data, function(rep, index) {
                            points += parseInt(rep.stargazers_count)*5;
                        });
                    }
                }, function(response) {
                    $scope.erroReq = "Erro ao acessar repositórios: "+response.message;
                    $scope.reset();
                });
    }

    $scope.getUser = function(url, index) {
        $http.get(url)
                .then(function(response) {
                    if(response.status === 200){
                        var points = parseInt(response.data.followers*2);
                        $scope.getRep(url, index, response.data.public_repos, points);
                        $scope.users.push({
                            id: response.data.id,
                            name: response.data.name,
                            login: response.data.login,
                            followers: response.data.followers,
                            avatar_url: response.data.avatar_url,
                            points: points
                        });
                    }
                }, function(response) {
                    $scope.erroReq = "Dados de usuário inválidos!";
                    $scope.reset();
                });
    }

    $scope.compareUsers = function(isValid) {
        if(isValid) {
            $scope.reset();
            $scope.erroReq = "";
            var url = "https://api.github.com/users/";
            var reqUser1 = url + $scope.user1;
            var reqUser2 = url + $scope.user2;
            $scope.getUser(reqUser1, 0);
            $scope.getUser(reqUser2, 1);
        }else{
            $scope.erroReq = "Dados dos campos são inválidos!";
        }
    }
});