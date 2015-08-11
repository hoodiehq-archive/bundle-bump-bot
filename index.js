#!/usr/bin/env node

if (!(process.env.GH_TOKEN && process.env.CI === 'true')) {
  process.exit(1)
}

var path = require('path')
var fs = require('fs')

var githubChangeRemoteFile = require('github-change-remote-file')
var semver = require('semver')

var pkg = fs.readFileSync(path.join(process.cwd(), 'package.json'))

var options = {
  user: 'hoodiehq',
  repo: 'hoodie',
  filename: 'package.json',
  transform: function (bundlePkg) {
    bundlePkg = JSON.parse(bundlePkg)
    bundlePkg.dependencies[pkg.name] = pkg.version
    return JSON.stringify(bundlePkg)
  },
  token: process.env.GH_TOKEN
}

var parsed = semver.valid(pkg.version).split('.')

var messageFragment = 'updated ' + pkg.name + 'to version ' + pkg.version

if (parsed[1] === '0' && parsed[2] === '0') {
  // this is a breaking change
  // we don't really know if it's a feature or fix
  // so we just use the `chore` type so this can be determined by humans
  // also we're only sending a PR rather than pushing to master

  options.message = 'chore(package): ' + messageFragment
  options.pr = {
    title: '[Potentially Breaking] ' + messageFragment,
    body: fs.readFileSync(path.join(__dirname, 'pr-body.md')).toString()
  }
} else if (parsed[1] !== '0' && parsed[2] === '0') {
  options.message = 'feat(package): ' + messageFragment
  options.push = true
} else {
  options.message = 'fix(package): ' + messageFragment
  options.push = true
}

githubChangeRemoteFile(options, function (err, res) {
  if (err) throw console.log(err)

  if (res.html_url) console.log(res.html_url)
  if (res.object && res.object.url) console.log(res.object.url)
})
