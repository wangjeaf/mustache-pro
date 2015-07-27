module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            main: ["dist"]
        },
        concat: {
            options: {
                seperator: ';',
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */',
            },
            main: {
                src: ['lib/mustache.js', 'src/ext.js', 'src/filters.js'],
                dest: 'dist/mustache-pro.js'
            }
        },
        uglify: {
            main: {
                src: ['dist/mustache-pro.js'],
                dest: 'dist/mustache-pro.min.js'
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', [
        'clean',
        'concat',
        'uglify'
    ]);
}