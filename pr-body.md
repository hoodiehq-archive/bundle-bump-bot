Dear Hoodie maintainer,

[<%= name %>](<%= repository.url %>) just released a new major version -- [<%= version %>](<%= release %>).
I'm just a bot and unfortunately I can't yet know if that breaks Hoodie as well.

Generally if a breaking change appears in a component there are two options:

1. A new version of an accompanying component makes up for the breaking change, so that if they're used together the public API doesn't break.
2. This is an actual breaking change for Hoodie as well.

Please try and figure that out with your amazing human brain.

In case of the former please wait for the accompanying component to release its new version and manually update both versions in one commit. You can close this PR.

In case of the latter please document the breaking change by adding another empty commit that declares the breaking change and includes migration instructions.

This could look something like this:

```
git commit --allow-empty
```

The editor opens.

> docs(changelog): declare breaking change
>
> BREAKING CHANGE: Feature xyz broke in version x.y.z of hoodie-whatever.
>
> Please use hoodie.foo() instead of hoodie.bar() from now on.



Thank you,

– HoodieBot :heart:
