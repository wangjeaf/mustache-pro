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
                src: [
                    'lib/mustache-start.js', 

                    'src/utils.js',
                    'src/support-if.js',
                    'src/support-index.js',
                    'src/support-renderer.js',
                    'src/support-filter.js',
                    'src/support-subtmpl.js',
                    'src/hack.js', 
                    
                    'src/filters.js',
                    'src/renderers.js',

                    'lib/mustache-end.js'
                ],
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