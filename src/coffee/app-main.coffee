"use strict"
dropboxApp = angular.module("dropboxApp", [])
.config(["$routeProvider", "$locationProvider", ($routeProvider, $locationProvider) ->
    $locationProvider.html5Mode true
])
.service "Files", ->
    []
.service "Playlist", ->
    []
.service "Audio", ->
    $("#player_audio").get 0
.service "DropboxClient", -> 
    clientLocal= new DropboxClient {key: "mopkmj33l694335", secret: "rw4s5jejxcvng8l"}
    clientLocal.authenticate {interactive: true}, (error, clientLocal) -> 
        alert(error) if error 
        if (clientLocal.isAuthenticated())
            $("#loader").hide()
            $("#signin").html "ZALOGOWANY"
        else
            $("#loader").hide()
            $("#signin").html "ZALOGUJ"
            $("#signin").on "click",(event)->
                clientLocal.authenticate (error, clientLocal) ->
                    alert error if error
    dropboxClient = {user:"", client: clientLocal}
.factory 'socket', ($rootScope) ->
    socket = io.connect "http://localhost:3000"
    {
        on: (eventName, callback) ->
            socket.on eventName, () ->
                args=arguments
                $rootScope.$apply ()->
                    callback.apply socket, args
        emit: (eventName, data, callback) ->
            socket.emit eventName, data, () ->
                args=arguments
                $rootScope.$apply ()->
                    callback.apply socket args if callback
    }

dropboxApp.controller "DropboxController", ($scope, DropboxClient, Files) ->
    path = "/Aplikacje/Audiosync"
    DropboxClient.client.getAccountInfo (error, accountInfo) ->
        return showError error if error
        DropboxClient.user = accountInfo.uid
    DropboxClient.client.readdir path, (error, entries) ->
        return showError if error
        entries.forEach (entry)->
            DropboxClient.client.makeUrl path+"/"+entry, {download: true}, (error, data)->
                Files.push {
                    'name': entry.replace(".mp3",""),
                    'savedPosition': '01:00',
                    'length': '05:00',
                    'lastDevice': 'Android',
                    'lastListened': '02.12.2012 09:30',
                    'source': data.url,
                    'currentPosition': '02:12'}
                $scope.$apply()
dropboxApp.controller "PlaylistController", ($scope, $timeout, DropboxClient, Audio, Playlist, socket) ->
    $scope.playlist = Playlist
    checkTime = true
    lastTime = true
    $scope.PlayFile = (index) ->
        unless Playlist[index]==undefined
            $timeout.cancel mytimeout
            socket.emit "mongo:get", {title: Playlist[index].name, user: DropboxClient.user}
            $("$player_audio").attr "src", Playlist[index].source
            Audio.load()
            Audio.play()
            $scope.counter = 0
            $scope.onTimeout = ()->
                $scope.counter++
                unless lastTime==Audio.currentTime
                    lastTime = Audio.currentTime
                    socket.emit "mongo:save", {title: Playlist[index].name, time: Audio.currentTime, user: DropboxClient.user}
                mytimeout = $timeout $scope.onTimeout, 5000
            mytimeout = $timeout $scope.onTimeout, 5000
            Audio.addEventListener('ended', () ->
                this.currentTime=0
                $timeout.cancel mytimeout
                $scope.PlayFile index+1
            , false)
        else
            $timeout.cancel mytimeout
            alert "stop"
    $scope.RemoveFromPlaylist = (index) ->
        Playlist.splice index 1
        socket.on "mongo:haveRecord", (message)->
            console.log message.title+":"+message.time
            $("#player_audio").bind 'canplay', () ->
                this.currentTime = message.time;

dropboxApp.controller "FilesController", ($scope, Files, Playlist, socket) ->
    $scope.message=""
    $scope.messages=[]
    $scope.files=Files
    $scope.AddFileToPlaylist = (index)->
        Playlist.push(Files[index])








