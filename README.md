# @hoodie/bundle-bump-bot

> automatically bump the top level module when a hoodie component has a new version

`npm i -D @hoodie/bundle-bump-bot`

Add this to the package.json of a top-level hoodie-component like hoodie-server, or hoodie-client:

```json
"scripts": {
  "postsemantic-release": "bundle-bump-bot"
}
```
