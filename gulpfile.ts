import * as fs from 'fs'
import * as gulp from 'gulp'
import * as shell from 'gulp-shell'

gulp.task('mkdir', async (done: Function) => {
  if (!fs.existsSync('coverage')) {
    fs.mkdirSync('coverage')
  }

  return done()
})

gulp.task('clean:dist', shell.task(['del-cli ./dist']))

gulp.task('clean:index', shell.task(['del-cli ./index.js ./index.d.ts']))

gulp.task('clean', gulp.parallel('clean:dist', 'clean:index'))

gulp.task('compile', shell.task(['tsc']))

gulp.task('docs', shell.task(['typedoc']))

gulp.task('mocha', shell.task(['mocha']))

gulp.task('mocha:coverage', shell.task(['nyc mocha']))

gulp.task('mocha:xunit', shell.task(['nyc mocha --reporter=xunit --reporter-options output=./coverage/mocha.xml']))

gulp.task('eslint', shell.task(['prettier-standard --check --lint'], { ignoreErrors: true }))

gulp.task('eslint:fix', shell.task(['prettier-standard --lint'], { ignoreErrors: true }))

gulp.task(
  'eslint:xunit', // Broken
  shell.task(['eslint --format junit --ext .ts . > ./coverage/eslint.xml'], {
    ignoreErrors: true
  })
)

gulp.task('codecov', shell.task(['codecov -t 7f3b18f1-5a06-49da-be74-b71410c39432']))

gulp.task('test', gulp.series(/* gulp.series('mkdir', 'eslint:xunit'), */ 'mocha:xunit'))

gulp.task('test:local', gulp.series('eslint', 'mocha:coverage'))
