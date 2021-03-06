'use strict';
var crypto = require('crypto');
var gutil = require('gulp-util');
var through = require('through2');
var Buffer = require('buffer').Buffer;
var path = require('path');
var fs = require('fs');
var PluginName = 'gulp-static-cache';
var glob = require("glob");

function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

function stringMd5(contents){
    return md5(contents).slice(0, 8);
}

function delVersion(path){
    var versionRegx = /(\?)\w+\=.*/;
    return path.replace(versionRegx, '')
}


module.exports = function (options) {
    options = options || {}
    var relativeUrls = options.relativeUrls || './';
    var regx = options.patterns || /[^'";\(]+?\.(?:png|jpe?g|gif|ico|cur|css|js)(?:\?\w+\=\w+)?/ig;

    return through.obj(function (file, enc, cb){
        var self = this;
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            self.emit('error', new gutil.PluginError(PluginName, 'Streaming not supported'));
            return cb();
        }

        var content = file.contents.toString();
        var filePaths = content.match(regx);
        // 防止出现null的情况
        if(!filePaths) return cb();

        filePaths.forEach(function(f){
            var truePath = path.join(relativeUrls, f);
            truePath = delVersion(truePath);
            truePath = glob.sync(truePath).toString();

            if(f.substring(0, 3) == '../'){
                var fPath = file.path.substring(0, file.path.lastIndexOf(path.sep));
                truePath = path.join(fPath, f);
            }
            try{
                var fContent = fs.readFileSync(truePath).toString();
            }catch (err){
                return;
            }
            var defPath = delVersion(f);
            var hash = stringMd5(fContent);
            var ext = path.extname(truePath);
            var filename = path.basename(defPath, ext) + ext + '?v='+hash;
            content = content.replace(f, path.dirname(f) + '/' + filename);
        });
        file.contents = new Buffer(content);
        this.push(file);
        cb();

    });

};