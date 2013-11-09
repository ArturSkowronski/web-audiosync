'use strict';

// Declare app level module which depends on filters, and services

var dropboxApp = angular.module('dropboxApp', []).
    service('Files', function() {
        return [
            {
                'name': 'Wiedźmin 1',
                'savedPosition': '01:00',
                'length': '05:00',
                'lastDevice': 'Nexus 4',
                'lastListened': '02.12.2012 09:30',
                'source': 'http://dccomics.com.pl',
                'currentPosition': '02:12'
            },
            {
                'name': 'Wiedźmin 1',
                'savedPosition': '01:00',
                'length': '05:00',
                'lastDevice': 'Android',
                'lastListened': '02.12.2012 09:30',
                'source': 'http://dccomics.com.pl',
                'currentPosition': '02:12'
            }
        ];

});

dropboxApp.controller('FilesController', function FilesController($scope, Files) {

    $scope.files = Files;
    console.log(Files)
    $scope.currentFile= $scope.files[0];

    $scope.AddToFileList = function AddToFileList($scope) {
        console.log("test")
        Files.push( {
            'name': 'Wiedźmin 1',
            'savedPosition': '01:00',
            'length': '05:00',
            'lastDevice': 'Android',
            'lastListened': '02.12.2012 09:30',
            'source': 'http://dccomics.com.pl',
            'currentPosition': '02:12'
        });
    }
});



