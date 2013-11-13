#Project Goals
Project is created to resolve problem synchronization of audio files (particulary Audiobooks) between many different devices. It remember time when user stopped listen music on device and give him opportunity to start it on the another one.

#Project Dependency
Project is developed using Dropbox JavaScript API and uses its storage to host audio files. All Dropobox application needs to be accepted by them, in future it will be one of the goals, currently app needs to be run on localhost

Project uses node.js as it's server side and AngularJS as client framework. All dependencies and bindings are provided by npm && bower. Application uses express.js as backend framework. Communication between client and server is decoupled, provided by Websocket messages which is supported by socket.io library.

Project is host locally by grunt throught nodeman. Grunt provide make-style support for js, providing functionality like autorefreshing webpage and server on every file change and monitoring.

Project uses mongoDB as it's database. This NoSQL document-based database is well suited for fast, low latency write operations.

#Installation Process
##Prerequisities
* MongoDB ~2.2
* Node.JS ~0.8
* Bower ~1.2
* Grunt-CLI ~0.1

##Instalation & Run
* Run local instance of Mongod 
* Install NPM && Bower dependencies
* Run application using Grunt (grunt command)

#Next Milestones
* Creating mobile android webclient/app
* Implementing support for other cloud storages (Box.net, SkyDrive, Google Drive)
* Implementation of howler.js as audio support in web client
* Refactoring Angular Modules & increase encapsulation throught implementing RequireJS
* Preparing Test Suite for project
* Rewriting JS modules to CoffeScript and CSS to SASS
* Better usability of web client
* Synchronizing playlist data between clients
* Other than WebKit render support
* Files prebuffering
