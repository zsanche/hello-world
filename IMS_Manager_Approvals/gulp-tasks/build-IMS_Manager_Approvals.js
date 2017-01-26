module.exports = function(gulp, plugins, env, buildProperties, component) {
    return {
        deps : [],
        run : function() {            		
            var scriptFilter = plugins.filter(["**/*.js"]);

			if(buildProperties.uglify){
				return gulp.src([component.srcFolder + "/" +"manager-approvals/**"], { base : component.srcFolder })
				.pipe(scriptFilter)
				.pipe(plugins.uglify())
                .pipe(scriptFilter.restore())
                .pipe(gulp.dest(component.srcFolder + "/" + buildProperties.buildFolder));
			}
			else{
				return gulp.src([component.srcFolder + "/" +"manager-approvals/**"], { base : component.srcFolder })				
                .pipe(gulp.dest(component.srcFolder + "/" + buildProperties.buildFolder));
			}
        }
    };
};