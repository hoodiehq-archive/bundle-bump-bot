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

// Ensure that we get a standard github repository URL for
// insertion into the template
pkg.repository.url = githubUrl(pkg.repository.url)

// Link to the package version that has just been released!
pkg.release = pkg.repository.url + '/releases/tag/v' + pkg.version

var options = {
  user: 'hoodiehq',
  repo: 'hoodie',
  filename: 'package.json',
  transform: function (bundlePkg) {
    bundlePkg = JSON.parse(bundlePkg)
    var oldVersion = bundlePkg.dependencies[pkg.name] || '0.0.0'
    bundlePkg.dependencies[pkg.name] = pkg.version

    var options = pushOrPR(oldVersion, pkg.version)
    options.content = JSON.stringify(bundlePkg, null, 2) + '\n'

    return options
  },
  token: process.env.GH_TOKEN
}

function pushOrPR (oldVersion, newVersion) {
  var messageFragment = 'updated ' + pkg.name + ' to version ' + pkg.version

  // remove ranges
  oldVersion = oldVersion.replace(/^[\^~]/, '')

  if (!semver.valid(oldVersion)) {

    // In the pr this will say:
    // [Name] just released a new 'version' -- [version]
    pkg.type = 'version'

    return {
      message: 'chore(package): ' + messageFragment,
      pr: {
        title: messageFragment
      }
    }
  }

  var diff = semver.diff(oldVersion, newVersion)

  if (diff === 'major') {

    // In the pr this will say:
    // [Name] just released a new 'major version' -- [version]
    pkg.type = 'major version'

    // we don't really know if it's a feature or fix
    // so we just use the `chore` type so this can be determined by humans
    // also we're only sending a PR rather than pushing to master
    return {
      message: 'chore(package): ' + messageFragment,
      pr: {
        title: '[Potentially Breaking] ' + messageFragment,
        // Read the pr-body file and process it with lodash.template
        body: template(
          fs.readFileSync(path.join(__dirname, 'pr-body.md')).toString()
        )(pkg)
      }
    }
  }

  if (diff === 'minor') {

    // In the pr this will say:
    // [Name] just released a new 'minor version' -- [version]
    pkg.type = 'minor version'

    return {
      message: 'feat(package): ' + messageFragment,
      push: true
    }
  }

  if (diff === 'patch') {

    // In the pr this will say:
    // [Name] just released a new 'patch' -- [version]
    pkg.type = 'patch'

    return {
      message: 'fix(package): ' + messageFragment,
      push: true
    }

  }

  // In the pr this will say:
  // [Name] just released a new 'version' -- [version]
  pkg.type = 'version'

  return {
    message: 'chore(package): ' + messageFragment,
    pr: {
      title: '[Pre-Release] ' + messageFragment
    }
  }
}

githubChangeRemoteFile(options, function (err, res) {
  if (err) throw console.log(err)

  if (res.html_url) console.log(res.html_url)
  if (res.object && res.object.url) console.log(res.object.url)
})
