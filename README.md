#Project Goals
Project is created to resolve problem synchronization of audio files (particulary Audiobooks) between many different devices. It remember time when user stopped listen music on device and give him opportunity to start it on the another one.

#Project Dependency
Project is developed using Dropbox JavaScript API and uses its storage to host audio files.
Project uses node.js as it's server side and AngularJS as client framework. All dependencies and bindings are provided by npm && bower. 
Project is host locally by grunt throught nodeman. 
Project uses mongoDB as it's database.

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
* Files prebuffering
