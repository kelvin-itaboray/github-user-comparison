require('angular');

//Module
let app = angular.module('ComparadorUsuarios', []);

//Services
app.service('userService', function($http, $q) {
    const self = this;

    /*Funcao para retornar a pontuacao de um determinado usuario
        1 Follower = 2 pontos
        1 Star = 5 pontos
    */
    this.getPoints = (userURL, repLength, followers) => {
        const repURL = `${userURL}/repos?per_page=${repLength}`;
        return $http.get(repURL)
            .then(response => {
                if(response.status === 200)
                    return response.data;
            }, error => showError(error))
            .then(reps => {
                    let points = followers*2;
                    for (let rep of reps)
                        points += parseInt(rep.stargazers_count)*5;
                    return points;
            }, error => showError(error));
    }

    //Funcao para atualizar campo vencedor de um determinado objeto usuario
    this.isWinner = (users, currentUser) => {
        let deferred = $q.defer();
        let isWinner = true;
        for(let user of users) {
            if(currentUser.points < user.points)
                isWinner = false;
        }
        deferred.resolve(isWinner);
        return deferred.promise;
    }

    //Funcao para GET de apenas um usuario
    this.getUser = (username, index) => {
        const url = `https://api.github.com/users/${username}`;
        return $http.get(url)
            .then(response => {
                if(response.status === 200)
                    return response.data;
            }, error => showError(error))
            .then(user => {
                return self.getPoints(url, user.public_repos, user.followers)
                    .then(points => {
                        return {
                            index: index,
                            id: user.id,
                            name: user.name,
                            login: user.login,
                            followers: user.followers,
                            avatar_url: user.avatar_url,
                            points: points,
                            vencedor: false
                        }
                    })
                    .catch(error => showError(error));
            }, error => showError(error));
    }

    //Funcao para GET de todos os usuarios, apos receber usuarios, eh calculado quem eh o vencedor
    this.getUsers = usernames => {
        let deferred = $q.defer();
        let users = [];
        for(let [index, username] of Object.entries(usernames)) {
            self.getUser(username, index)
                .then(response => {
                    users.push(response);
                    if(users.length == usernames.length){
                        for(let user of users) {
                            self.isWinner(users, user)
                                .then(response => {
                                    user.vencedor = response;
                                })
                                .catch(error => showError(error));
                        }
                    }
                })
                .catch(error => showError(error));
        }
        deferred.resolve(users);
        return deferred.promise;
    }
});

//Controller
app.controller('comparadorUsuariosController', function($scope, $http, $q, userService) {
    $scope.formUsers = {};
    $scope.users = [];
    $scope.erroReq = "";

    //Reinicializador de valores
    reset = () => {
        $scope.users = [];
        $scope.erroReq = "";
    }

    //Funcao para exibir erros retornados por outras funcoes
    showError = error => {
        reset();
        $scope.erroReq = `Erro: ${error}`;
    }

    //Funcao para verificar input dos valores, se sao validos e repetidos
    checkInput = isValid => {
        if(!isValid){
            $scope.erroReq = "Erro: Ainda há campos a serem preenchidos.";
            return false;
        }if($scope.user1 === $scope.user2){
            $scope.erroReq = "Erro: Ambos os nomes de usuário são idênticos.";
            return false;
        }else
            return true;
    }

    //Funcao que verifica qual o usuario vencedor e exibe-o, sendo retornando EMPATE caso haja mais de um vencedor
    $scope.showWinner = (users, currentUser) => {
        let winners = 0;
        for(let user of users) {
            if(user.vencedor)
                winners++;
        }

        if(winners > 1)
            return "EMPATE";
        else if(winners === 1 && currentUser.vencedor)
            return `${currentUser.login} VENCEU`;
        else
            return "";
    }

    //Funcao submit do formulario, no qual chama getUsers e retorna um array de objetos de usuarios com suas respectivas informacoes
    $scope.compareUsers = isValid => {
        if(checkInput(isValid)) {
            reset();
            userService.getUsers([$scope.user1, $scope.user2])
                .then(users => $scope.users = users)
                .catch(error => showError(error));
        }
    }
});