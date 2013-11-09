module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'bower_components/bootstrap/', src: ['less/*.less',  'img/*'], dest: 'src/', filter: 'isFile'}, 
          {expand: true, cwd: 'bower_components/bootstrap/js/', src: ['*.js'], dest: 'src/js/bootstrap/', filter: 'isFile'}, 
          {expand: true, cwd: 'bower_components/jquery/', src: ['jquery.js'], dest: 'src/js/', filter: 'isFile'}
        ]
      }
    },
    coffee: {
      glob_to_multiple: {
        expand: true,
         flatten: true,
         cwd: 'src/coffee',
         src: ['*.coffee'],
         dest: 'public/js',
         ext: '.js'
      }
    },
    jade: {
        files: ['views/{,*/}*.jade'],
        tasks: ['jade']
    },
    sass: {
    global: {
      files: [{
        expand: true,
        cwd: 'src/sass',
        src: ['*.scss'],
        dest: 'public/css',
        ext: '.css'
      }]
  }},
    concat: { 
      options: {
        separator: ';'
      },
      dist: {
        files: {
          'public/js/bootstrap.js': ['src/js/bootstrap/*.js'],
          'public/js/jquery.js': ['src/js/jquery.js']
        }
        
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'public/js/min/bootstrap.min.js': ['public/js/bootstrap.js'],
          'public/js/min/jquery.min.js': ['public/js/jquery.js']
        }
      }
    },
    nodemon: {
      prod: { 
        options: { 
        file: 'app.js'
        }
      }
    },
    jshint: {
      files: ['gruntfile.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
       
    },
    watch: {
       sassWatch: {
                files: [
                    'src/sass/*.scss'
                ],
                tasks: ['sass:global']
            },
              coffeeWatch: {
                files: [
                    'src/coffee/*.coffee'
                ],
                tasks: ['coffee']
            },
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'concat', 'uglify'],
      livereload: {
        files: [
            '.tmp/*.html',
            'public/css/*.css',
            'public/js/*.js',
            'views/*.jade',
            'views/partials/*.jade'
        ],
         options: {
          livereload: true
        }
      }
     },
        concurrent: {
        target: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        }
    }
  });
  grunt.loadNpmTasks('grunt-jade');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon'); 
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-sass'); 
  grunt.registerTask('default', ['jshint','concat', 'sass:global','coffee','uglify','concurrent:target','watch']);
  grunt.registerTask('build', ['copy']);
 
};