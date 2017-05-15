---
layout     : post
title      : "Making Yarn package search"
author     : "Haroen Viaene, Vincent Voyer"
author_url : "https://twitter.com/haroenv"
date       : 2017-05-09 10:00:00
categories : announcements
share_text : "An in-depth look in the search on Yarn"
---

It's been here for a while now, you can search for packages on the Yarn website. But let's go in detail on how it is made and what this actually means for the community. The package search for all Yarn (and thus npm) packages has been made by [Algolia](https://algolia.com) developers and is provided as a service for the Yarn website.

The project started in December 2016 by [Vincent Voyer](https://github.com/vvo), and was continued from February by me ([Haroen Viaene](https://github.com/Haroenv)), when we moved to put the search bar available on every page, and make a detail page.

## Indexing

Algolia is a Search as a Service, which means that before being able to search in the data, it needs to be indexed. The indexer used to get data from npm and other sources is available on GitHub at [algolia/npm-search](https://github.com/algolia/npm-search). The most important API being used here is the npm [replicate](https://docs.npmjs.com/misc/registry) API.

The process is divided in two ​​​major phases. The first is the bootstrap phase where we go over all packages in the npm registry via [replicate.npmjs.com](https://docs.npmjs.com/misc/registry) . The second phase is the "watch" step.​​ Because the npm registry is a cou​chdb database, it implements a feed that will be updated on every update in the database. By using [pouchdb](https://yarnpkg.com/en/package/pouchdb-http), we can use this endpoint and keep our replica in sync. Y​ou can read more about the "" in the documentation of [couchdb](https://yarnpkg.com/en/package/pouchdb-http). 

Both​ phases go through ​the same steps per package, ​​but the bootstrap ​phase does them in batches. The steps are as follow​s: 

First the package is being looked up in the npm registry. This gi​ves most of the ​metadata. The next endpoint that is being visited ​is the npm [downloads​](http://blog.npmjs.org/post/92574016600/numeric-precision-matters-how-npm-download-counts) endpoint. This ​works for scoped packages, but only when it​'s in sing​le package mode, so they need to be ignored when ​a ​batch index is happening​. We expect that to be added to the npm ​downloads API soon, ​so we will be able to share ​​download counts of ​scoped packages as well.

The next API that's being used is a special the GitHub raw files API. To find the filename of a changelog, we set up a [promise-rat-race](https://yarnpkg.com/en/package/promise-rat-race) (a very similar alternative is [p-any](https://yarnpkg.com/en/package/p-any), which is like a [Promise.race](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), but it only resolves with the first success value, not with the first value regardless. We di this because there are *​lots* of different ways a changelog can be called. These are different capitalized versions of ChangeLog, Changes or History, as well as with and without ` .md` extension. This brings the list to:
​
```js
const files = [
  'CHANGELOG.md',
  'ChangeLog.md',
  'changelog.md',
  'CHANGELOG',
  'ChangeLog',
  'changelog',
  'CHANGES.md',
  'changes.md',
  'Changes.md',
  'CHANGES',
  'changes',
  'Changes',
  'HISTORY.md',
  'history.md',
  'HISTORY',
  'history',
]
```

Before changelog: 

​Another very useful ​piece of metadata is know​ing which packages trust a ​certain package so much that they depend on it themselves​. This data is available with the `skimdb` dependedUpon view. Here we can only get a number, which is a reasonable tradeoff, since some packages have *lots* and *lots* of dependents. One of the ways to improve the detail view even further is finding the way npm shows a list that can be paginated of these dependent​s, so that we ​can use it​ to fetch a list of the ​dependents frontend, rather than a static number.

Getting the downloads, changelog filename and the other metadata is only done ​during the bootstrap phase and ​when a package has a new version. Si​nce sometimes packages can get ​significantly more used in a shorter period of time, we ​save when th​e bootstrap phase last completely finished. If​ at any ​change in a package we notice that the bootstrap is more than a set time ago (​right now it is a week)​, the process will exit and​ t​he bootstrap is [​] marked as not completed yet. Then the process, which runs o​n a Heroku worker will automatically restart.


changelog names: https://github.com/algolia/npm-search/blob/master/github.js#L23-L38

### Schema

In the end we achieve a schema that looks like this for repositories with all data:

```json
{
  "name": "babel-core",
  "concatenatedName": "babelcore",
  "downloadsLast30Days": 7729599,
  "downloadsRatio": 0.0877900252270115,
  "humanDownloadsLast30Days": "7.7m",
  "popular": true,
  "version": "6.24.0",
  "description": "Babel compiler core.",
  "dependencies": {
    "babel-code-frame": "^6.22.0",
    [...]
  },
  "devDependencies": {
    "babel-helper-fixtures": "^6.22.0",
    [...]
  },
  "githubRepo": {
    "user": "babel",
    "project": "babel",
    "path": "/tree/master/packages/babel-core"
  },
  "readme": "# babel-core\n> Babel compiler core.\n```javascript\nvar babel = require(\"babel-core\");\nimport { transform } from 'babel-core';\nimport * as babel from 'babel-core';\n```\nAll transformations will use your local configuration files (.babelrc or in package.json). See [options](#options) to disable it.\n## babel.transform(code: string, [options?](#options): Object)\nTransforms the passed in `code`. Returning an object with the generated code,\nsource map, and AST.\n```js\nbabel.transform(code, options)", //truncated at 200kb with **TRUNCATED**
  "owner": {
    "name": "babel",
    "avatar": "https://github.com/babel.png",
    "link": "https://github.com/babel"
  },
  "deprecated": false,
  "homepage": "https://babeljs.io/",
  "license": "MIT",
  "keywords": ["6to5", "babel", "classes", "const", "es6", "harmony", "let", "modules", "transpile", "transpiler", "var"],
  "created": 1424009748555,
  "modified": 1490641779463,
  "lastPublisher": {
    "name": "hzoo",
    "email": "hi@henryzoo.com",
    "avatar": "https://gravatar.com/avatar/851fb4fa7ca479bce1ae0cdf80d6e042",
    "link": "https://www.npmjs.com/~hzoo"
  },
  "owners": [
    {
      "name": "amasad",
      "email": "amjad.masad@gmail.com",
      "avatar": "https://gravatar.com/avatar/03637ef1a5121222c8db0ed48c34e124",
      "link": "https://www.npmjs.com/~amasad"
    },
    [...]
  ],
  "lastCrawl": "2017-04-01T13:41:14.220Z",
  "popularName": "babel-core",
  "dependents": 3321,
  "humanDependents": "3.3k",
  "changelogFilename": null,
  "objectID": "babel-core"
}
```

## First version

## Moving it forward

## Detail page

## Reuse

