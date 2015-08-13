#!/usr/bin/env node

if (!(process.env.GH_TOKEN && process.env.CI === 'true')) {
  process.exit(1)
}

var path = require('path')
var fs = require('fs')

var githubChangeRemoteFile = require('github-change-remote-file')
var githubUrl = require('github-url-from-git')
var template = require('lodash.template')
var semver = require('semver')

var pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')))

var options = {
  user: 'hoodiehq',
  repo: 'hoodie',
  filename: 'package.json',
  transform: function (bundlePkg) {
    bundlePkg = JSON.parse(bundlePkg)
    bundlePkg.dependencies[pkg.name] = pkg.version
    return JSON.stringify(bundlePkg, null, 2) + '\n'
  },
  token: process.env.GH_TOKEN
}

var parsed = semver.valid(pkg.version).split('.')

var messageFragment = 'updated ' + pkg.name + ' to version ' + pkg.version

// Read the pr-body file and process it with lodash.template
var messageBody = template(
  fs.readFileSync(path.join(__dirname, 'pr-body.md')).toString()
)

// Ensure that we get a standard github repository URL for
// insertion into the template
pkg.repository.url = githubUrl(pkg.repository.url)

// Link to the package version that has just been released!
pkg.release = pkg.repository.url + '/releases/tag/v' + pkg.version

// Insert the contents of 'package.json' into the messageBody, replacing all
// template variables with the message file with the correct package contents
messageBody(pkg)

if (parsed[1] === '0' && parsed[2] === '0') {
  // this is a breaking change
  // we don't really know if it's a feature or fix
  // so we just use the `chore` type so this can be determined by humans
  // also we're only sending a PR rather than pushing to master

  options.message = 'chore(package): ' + messageFragment
  options.pr = {
    title: '[Potentially Breaking] ' + messageFragment,
    body: messageBody
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
