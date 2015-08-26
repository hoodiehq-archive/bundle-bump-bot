# @hoodie/bundle-bump-bot

> automatically bump a top level module when a component has a new version

`npm i -D bundle-bump-bot`

Add this to the package.json of a component (e.g. hoodie-server or hoodie-client of hoodie):

```json
"scripts": {
  "postsemantic-release": "bundle-bump-bot"
}
```
