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
        socket.emit('dropboxLoaded', {user: DropboxClient.user});
    });

    DropboxClient.client.readdir(path, function(error, entries) {
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

        $scope.RemoveFromPlaylist = function(index) {
         Playlist.splice(index, 1);
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
    var wasInside=false;
    $scope.files = Files;

    socket.on('mongo:savedPlaylist', function (message) {
if(!wasInside)
           message.forEach(function(entry){
              
                Files.forEach(function(entry2){
                    if(entry.title==entry2.name) {
                        Playlist.push(entry2);
                        wasInside=true;}
                })           
           })
    });

    $scope.AddToFileToPlaylist = function (index) {
        Playlist.push(Files[index]);
        var message={title: Files[index].name, user: DropboxClient.user}
        socket.emit('addToPlaylist',message);
    }
});



