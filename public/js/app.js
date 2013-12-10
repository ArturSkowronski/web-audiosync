'use strict';

var dropboxApp = angular.module('dropboxApp', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true)
}]).service('Files',function () {
    return [];
}).service('Playlist',function () {
    return [];
}).service('Audio',function () {
    return $('#player_audio').get(0);
}).service('DropboxClient', function () {
    
    var clientLocal = new Dropbox.Client({
        key: "mopkmj33l694335",
        secret: "rw4s5jejxcvng8l"
    });

    clientLocal.authenticate({interactive: true}, function (error, clientLocal) {
        if (error) {
            return alert(error);
        }
        if (clientLocal.isAuthenticated()) {
            $("#loader").hide();
            $("#signin").html("ZALOGOWANY");
        } else {
            $("#loader").hide();
            $("#signin").html("ZALOGUJ");
            $("#signin").on("click", function (event) {
                clientLocal.authenticate(function (error, clientLocal) {
                    if (error) {
                        return alert(error);
                    }
                });
            });
        }
    });

    var dropboxClient = {
        user: "",
        client: clientLocal
    };
    


    return dropboxClient;
}).factory('socket', function ($rootScope) {
    var socket = io.connect('http://localhost:3000');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };
});;

dropboxApp.controller('DropboxController', function ($scope, socket, DropboxClient, Files) {
    var path="/Aplikacje/Audiosync"
    DropboxClient.client.getAccountInfo(function(error, accountInfo) {
        if (error) {
            return showError(error);
        }
        DropboxClient.user = accountInfo.uid;
    });
    
    DropboxClient.client.readdir(path, function(error, entries) {
        var socketFunctionSet=0;
        if (error) {
            return showError(error);  // Something went wrong.
        }
        entries.forEach(function(entry) {
          DropboxClient.client.makeUrl(path+"/"+entry, {download : true}, function(error, data){

            Files.push({
                'name': entry.replace(".mp3",""),
                'savedPosition': '01:00',
                'length': '05:00',
                'lastDevice': 'Android',
                'lastListened': '02.12.2012 09:30',
                'source': data.url,
                'currentPosition': '02:12'
          });

            $scope.$apply();
        socketFunctionSet++;
        console.log(socketFunctionSet+' dropboxLoaded '+entries.length);
        if(socketFunctionSet==entries.length){
            console.log('dropboxLoaded');
            socket.emit('dropboxLoaded', {user: DropboxClient.user});
        }
        
        });
      }); 
    });
});

dropboxApp.controller('PlaylistController', function ($scope, $timeout, DropboxClient, Audio,Playlist, socket) {
    $scope.playlist = Playlist;

    var checkTime=true;
    var lastTime=true;

    $scope.PlayFile = function PlayFile(index) {

        if(Playlist[index]!=undefined){
            $timeout.cancel(mytimeout);

            socket.emit('mongo:get', {
                title: Playlist[index].name,
                user: DropboxClient.user}
                );
            $("#player_audio").attr("src",Playlist[index].source);
            Audio.load();
            Audio.play();
            $scope.counter = 0;
            $scope.onTimeout = function(){
                $scope.counter++;
                if(lastTime!=Audio.currentTime){
                    lastTime=Audio.currentTime;
                    socket.emit('mongo:save', {
                        title: Playlist[index].name,
                        time: Audio.currentTime,
                        user: DropboxClient.user}
                        );
                }
                
                mytimeout = $timeout($scope.onTimeout,5000);
            }
            
            var mytimeout = $timeout($scope.onTimeout,5000);
            
            Audio.addEventListener('ended', function(){
                this.currentTime = 0;
                $timeout.cancel(mytimeout);
                $scope.PlayFile(index+1);
            }, false);}
            
            else{
                $timeout.cancel(mytimeout);
                alert("stop")
            }
        }

        
            
               socket.on('mongo:haveRecord', function (message) {
               console.log(message.title+":"+message.time);
               $("#player_audio").bind('canplay', function() {
               this.currentTime = message.time; // jumps to 29th secs
            }); 
        });
 });




dropboxApp.controller('FilesController', function ($scope, Files, DropboxClient, Playlist, socket) {
    $scope.message = '';
    $scope.messages = [];
    $scope.files = Files;

    console.log("socketInitializated");
        socket.on('mongo:savedPlaylist', function (message) {
           console.log("savedPlaylist");
           console.log(message);
           console.log("currentEntries");
           console.log(Files);
           message.forEach(function(entry){
                Files.forEach(function(entry2){
                               console.log("savedPlaylist");

                    if(entry.title==entry2.name) {

                        Playlist.push(entry2);
                        }
                })           
           })
    });

    socket.on('server:addToPlaylist', function (message) {
         console.log("addToPlaylist");
        Files.forEach(function(entry2){
                    if(message==entry2.name) {
                        Playlist.push(entry2);
        }
                })           
    });

   socket.on('server:deleteFromPlaylist', function (message) {
         console.log("deleteFromPlaylist");
         var y=0;
          

        Playlist.forEach(function(entry2){
            if(message==entry2.name) {
                  console.log(message+";"+entry2.name+";"+y);
                Playlist.splice(y,1);
                }
             y++;
                })           
    });

    $scope.AddToFileToPlaylist = function (index) {
        var message={title: Files[index].name, user: DropboxClient.user}
        socket.emit('addToPlaylist',message);
    }
    $scope.RemoveFromPlaylist = function(index) {
        var message={title: Playlist[index].name, user: DropboxClient.user}
        socket.emit('deleteFromPlaylist',message);
       }
});



