(function() {
  "use strict";
  var dropboxApp;

  dropboxApp = angular.module("dropboxApp", []).config([
    "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
      return $locationProvider.html5Mode(true);
    }
  ]).service("Files", function() {
    return [];
  }).service("Playlist", function() {
    return [];
  }).service("Audio", function() {
    return $("#player_audio").get(0);
  }).service("DropboxClient", function() {
    var clientLocal, dropboxClient;
    clientLocal = new DropboxClient({
      key: "mopkmj33l694335",
      secret: "rw4s5jejxcvng8l"
    });
    clientLocal.authenticate({
      interactive: true
    }, function(error, clientLocal) {
      if (error) {
        alert(error);
      }
      if (clientLocal.isAuthenticated()) {
        $("#loader").hide();
        return $("#signin").html("ZALOGOWANY");
      } else {
        $("#loader").hide();
        $("#signin").html("ZALOGUJ");
        return $("#signin").on("click", function(event) {
          return clientLocal.authenticate(function(error, clientLocal) {
            if (error) {
              return alert(error);
            }
          });
        });
      }
    });
    return dropboxClient = {
      user: "",
      client: clientLocal
    };
  }).factory('socket', function($rootScope) {
    var socket;
    socket = io.connect("http://localhost:3000");
    return {
      on: function(eventName, callback) {
        return socket.on(eventName, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            return callback.apply(socket, args);
          });
        });
      },
      emit: function(eventName, data, callback) {
        return socket.emit(eventName, data, function() {
          var args;
          args = arguments;
          return $rootScope.$apply(function() {
            if (callback) {
              return callback.apply(socket(args));
            }
          });
        });
      }
    };
  });

  dropboxApp.controller("DropboxController", function($scope, DropboxClient, Files) {
    var path;
    path = "/Aplikacje/Audiosync";
    DropboxClient.client.getAccountInfo(function(error, accountInfo) {
      if (error) {
        return showError(error);
      }
      return DropboxClient.user = accountInfo.uid;
    });
    return DropboxClient.client.readdir(path, function(error, entries) {
      if (error) {
        return showError;
      }
      return entries.forEach(function(entry) {
        return DropboxClient.client.makeUrl(path + "/" + entry, {
          download: true
        }, function(error, data) {
          Files.push({
            'name': entry.replace(".mp3", ""),
            'savedPosition': '01:00',
            'length': '05:00',
            'lastDevice': 'Android',
            'lastListened': '02.12.2012 09:30',
            'source': data.url,
            'currentPosition': '02:12'
          });
          return $scope.$apply();
        });
      });
    });
  });

  dropboxApp.controller("PlaylistController", function($scope, $timeout, DropboxClient, Audio, Playlist, socket) {
    var checkTime, lastTime;
    $scope.playlist = Playlist;
    checkTime = true;
    lastTime = true;
    $scope.PlayFile = function(index) {
      var mytimeout;
      if (Playlist[index] !== void 0) {
        $timeout.cancel(mytimeout);
        socket.emit("mongo:get", {
          title: Playlist[index].name,
          user: DropboxClient.user
        });
        $("$player_audio").attr("src", Playlist[index].source);
        Audio.load();
        Audio.play();
        $scope.counter = 0;
        $scope.onTimeout = function() {
          var mytimeout;
          $scope.counter++;
          if (lastTime !== Audio.currentTime) {
            lastTime = Audio.currentTime;
            socket.emit("mongo:save", {
              title: Playlist[index].name,
              time: Audio.currentTime,
              user: DropboxClient.user
            });
          }
          return mytimeout = $timeout($scope.onTimeout, 5000);
        };
        mytimeout = $timeout($scope.onTimeout, 5000);
        return Audio.addEventListener('ended', function() {
          this.currentTime = 0;
          $timeout.cancel(mytimeout);
          return $scope.PlayFile(index + 1);
        }, false);
      } else {
        $timeout.cancel(mytimeout);
        return alert("stop");
      }
    };
    return $scope.RemoveFromPlaylist = function(index) {
      Playlist.splice(index(1));
      return socket.on("mongo:haveRecord", function(message) {
        console.log(message.title + ":" + message.time);
        return $("#player_audio").bind('canplay', function() {
          return this.currentTime = message.time;
        });
      });
    };
  });

  dropboxApp.controller("FilesController", function($scope, Files, Playlist, socket) {
    $scope.message = "";
    $scope.messages = [];
    $scope.files = Files;
    return $scope.AddFileToPlaylist = function(index) {
      return Playlist.push(Files[index]);
    };
  });

}).call(this);
