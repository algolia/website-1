---
layout     : post
title      : "Making Yarn package search"
author     : "Haroen Viaene, Vincent Voyer"
author_url : "https://twitter.com/haroenv"
date       : 2017-05-09 10:00:00
categories : announcements
share_text : "An in-depth look in the search on Yarn"
---

Since December 2016, you can [search for JavaScript packages](https://yarnpkg.com/en/packages/) on the Yarn website. But we never talked about how it happened, what makes it different from other packages searches and what does it means for the community.

## How it happened

Search on the yarn website started with our documentation, we wanted people to easily find information on how to use Yarn. As other programming community websites we went for [DocSearch](https://community.algolia.com/docsearch/), this was covered in [yarnpkg/website#105](https://github.com/yarnpkg/website/pull/105).

Then another Yarn contributor ([@thejameskyle](https://github.com/thejameskyle)) asked in [yarnpkg/website#194] if we should get package searching abilities, much like [npm](http://npmjs.com/) had. We wanted something different in term of ranking and also display package details in a way that was re-thought.

This is where [Algolia](https://www.algolia.com/), the company I work for, comes into play. As a developer-focused search engine API, we were already fan of Yarn and wanted a cool hack for our end of the year (2016) gift.

On the 22nd December of 2016, Algolia engineers via [yarnpkg/website#322](https://github.com/yarnpkg/website/pull/322) then ten days later it got merged and instant-search for JavaScript packages was available on our website. At first there was no package details pages.

Early 2017, the core team of Yarn and Algolia team met for a one day brainstorming in London. The goal was to think about the package details page and evolutions of the search interface. Algolia proposed [invision](https://www.invisionapp.com/) design views of what search could be and from that we drafted a [master plan](https://gist.github.com/vvo/c801fb8b653eda9fb17de60987476b5e)!

## What makes it different

### Show results ⚡️ instantly

![demo of the Yarn search](https://dl.dropboxusercontent.com/u/3508235/2017-05-28%2022.37.08.gif)

Much like [Google instant](https://googleblog.blogspot.fr/2010/09/search-now-faster-than-speed-of-type.html) search. You should never have to wait for search results to be displayed: **just type and see results** being displayed immediately.

### Display many metadata context

After using npm search many times, we knew what was missing and what was superfluous from the search results and package detail pages. We brainstormed a bit and iterations after iterations added many useful metadata.

Here's a comparison between the two search results pages (npm on the left, Yarn on the right):

![npm search results on the left, Yarn search results on the right](https://dl.dropboxusercontent.com/u/3508235/npm-yarn-search.png)

Some metadata the Yarn search is providing on search results that npm does not:
- number of downloads indicator
- license of the package
- Current GitHub organization maintaining the package if any (rather than the last publisher or creator)
- last time package was updated
- tags
- npm link, homepage and GitHub homepage when relevant

This metadata helps us not having to open many package detail page before getting the information you want (like the GitHub homepage of a package).

For the **package detail page**, we took a similar approach:



## How it works

The first step to providing search for JavaScript packages is to replicate and monitor changes from the npm registry into an Algolia search index.

This replication code is all open-source and available at [algolia/npm-search](https://github.com/algolia/npm-search). The most important API being used here is the [npm replication](https://docs.npmjs.com/misc/registry) API.

The npm registry is backed by [CouchDB](http://couchdb.apache.org/) and using its [replication protocol](http://docs.couchdb.org/en/master/replication/protocol.html)

The process is divided in two major phases. The first is the bootstrap phase where we go over all packages in the npm registry via [replicate.npmjs.com](https://docs.npmjs.com/misc/registry) . The second phase is the "watch" step. Because the npm registry is a cou​chdb database, it implements a feed that will be updated on every update in the database. By using [pouchdb](https://yarnpkg.com/en/package/pouchdb-http), we can use this endpoint and keep our replica in sync. You can read more about the "" in the documentation of [couchdb](https://yarnpkg.com/en/package/pouchdb-http). 

The package search for all Yarn (and thus npm) packages has been made by [Algolia](https://algolia.com) developers and is provided as a service for the Yarn website.

The project started in December 2016 by [Vincent Voyer](https://github.com/vvo), and was continued from February by me ([Haroen Viaene](https://github.com/Haroenv)), when we moved to put the search bar available on every page, and make a detail page.

## What makes it different

## What we learned

## Indexing




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

https://discourse.algolia.com/t/2016-algolia-community-gift-yarn-package-search/319
