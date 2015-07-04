# gulp-static-cache

> 静态文件缓存更新

通过文件md5

#### options
Type: `object`

All `false` by default.

- {STRING} **relativeUrls** - 静态文件绝对路径地址，需要传入该参数

## Example
index.css:

```css
.a{
  background:url(../img/btn.png);
}
```

gulpfile.js:

```javascript
var gulp=require('gulp');
var staticcache = require('gulp-static-cache');

gulp.task('cache', function(){
    gulp.src('./src/**/**')
        .pipe(staticcache({
          relativeUrls: './src/css'
        }))
        .pipe(gulp.dest('dist/**'));
});
 
// 定义默认任务
gulp.task('default', function(){
  gulp.run('cache');
});
```

result:

```css
.a{
  background:url(../img/btn.png?v=145e423f);
}
```