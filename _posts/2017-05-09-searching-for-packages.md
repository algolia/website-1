---
layout     : post
title      : "Making Yarn package search"
author     : "Haroen Viaene, Vincent Voyer"
author_url : "https://twitter.com/haroenv"
date       : 2017-05-09 10:00:00
categories : announcements
share_text : "An in-depth look in the search on Yarn"
---

Since December 2016, you can [search for JavaScript packages](https://yarnpkg.com/en/packages/) on the Yarn website. But we never talked about [how it happened](#how-it-happened), what [makes it different](#what-makes-it-different) from other package search interfaces, [how it's made](#how-it-works) and [what it means for the community](#what-about-the-future).

## How it happened

Search on the Yarn website started with our documentation, we wanted people to easily find information on how to use Yarn. As other programming community websites we went for [DocSearch](https://community.algolia.com/docsearch/), this was covered in [yarnpkg/website#105](https://github.com/yarnpkg/website/pull/105).

Then another Yarn contributor ([@thejameskyle](https://github.com/thejameskyle)) asked in [yarnpkg/website#194](https://github.com/yarnpkg/website/issue/194) if we should get package searching abilities, much like [npm](http://npmjs.com/) had. We wanted something different in term of ranking and also display package details in a way that was re-thought.

This is where [Algolia](https://www.algolia.com/), the company I work for, comes into play. As a developer-focused search engine API, we were already fan of Yarn and wanted a cool hack for our end of the year (2016) gift.

On the 22nd December of 2016, Algolia engineers via [yarnpkg/website#322](https://github.com/yarnpkg/website/pull/322) then ten days later it got merged and instant-search for JavaScript packages was available on our website. At first there was no package details pages.

Early 2017, the core team of Yarn and Algolia team met for a one day brainstorming in London. The goal was to think about the package details page and evolutions of the search interface. Algolia proposed [invision](https://www.invisionapp.com/) design views of what search could be and from that we drafted a [master plan](https://gist.github.com/vvo/c801fb8b653eda9fb17de60987476b5e)!
 
 ## What makes it different

### Show results ⚡️ instantly

![demo of the Yarn search](/assets/posts/2017-05-09-searching-for-packages/search.gif)

Instead of showing a dropdown of results, we chose to replace the page completely with the search results. This requires more data to be available immediately, but gives more context on the choices you make while searching for a fitting package. Having the search page be the main entry point will make sure that you don't need to know exactly what you want before "committing" to a search.

### Display a lot of metadata context

After using npm search many times, we knew what was missing and what was superfluous from the search results and package detail pages. We brainstormed a bit and iteratively added many useful metadata.

Here's a comparison between the two search results pages (npm on the left, Yarn on the right):

![npm search results on the left, Yarn search results on the right](/assets/posts/2017-05-09-searching-for-packages/npm-yarn-search.png)

Some metadata the Yarn search is providing on search results that npm does not:
- number of downloads indicator
- license of the package
- Current GitHub organization maintaining the package if any (rather than the last publisher or creator)
- last time package was updated
- tags
- npm link, homepage and GitHub homepage when relevant
- deprecation message

This metadata helps us not having to open many package detail page before getting the information you want (like the GitHub homepage of a package).

For the **package detail page**, we took a similar approach. We started with the same metadata as npm shows, but show some other information as well. Information not visible in npm, which we decided to show in Yarn:

- Changelog
- GitHub stargazers
- Commit activity
- description
- deprecation message
- devDependencies
- browsing of the files
- previous versions

There's more data in the Algolia index than is shown, as well as some data that is being fetched from the frontend. As with everything, this is an iterative process, and changes are definitely welcome!

## How it works

The first step to providing search for JavaScript packages is to replicate and monitor changes from the npm registry into an "index" to search in. An index is a data structure which makes it possible to do a text search and filtering on a dataset. In this case we will use Algolia as index for the search.

The code for this replication is all open-source and available at [algolia/npm-search](https://github.com/algolia/npm-search). The most important API being used here is the [npm replication](https://docs.npmjs.com/misc/registry) API.

The npm registry is exposed as a [CouchDB](http://couchdb.apache.org/) database, which has a [replication protocol](http://docs.couchdb.org/en/master/replication/protocol.html) that can be used to either set up your own npm registry, or in this case a service that has the same data as npm.

The process is divided in two major phases. The first is the bootstrap phase where we go over all packages in the npm registry via [replicate.npmjs.com](https://docs.npmjs.com/misc/registry) . The second phase is the "watch" step. Because the npm registry is a cou​chdb database, it implements a feed that will be updated on every update in the database. By using [pouchdb](https://yarnpkg.com/en/package/pouchdb-http), we can use this endpoint and keep our replica in sync. You can read more about the [changes endpoint](http://docs.couchdb.org/en/2.0.0/api/database/changes.html) in the documentation of [pouchdb](https://yarnpkg.com/en/package/pouchdb-http). 

The package search for all Yarn (and thus npm) packages has been made by [Algolia](https://algolia.com) developers and is provided as a service for the Yarn website.

The project started in December 2016 by [Vincent Voyer](https://github.com/vvo), and was continued from February by me ([Haroen Viaene](https://github.com/Haroenv)), when we moved to put the search bar available on every page, and make a detail page.

### Indexing

Both​ phases go through ​the same steps per package, ​​but the bootstrap ​phase does them in batches. The steps are as follow​s: 

First the package is being looked up in the npm registry. This gi​ves most of the ​metadata. The next endpoint that is being visited ​is the npm [downloads​](http://blog.npmjs.org/post/92574016600/numeric-precision-matters-how-npm-download-counts) endpoint. This ​works for scoped packages, but only when it​'s in sing​le package mode, so they need to be ignored when ​a ​batch index is happening​. We expect that to be added to the npm ​downloads API soon, ​so we will be able to share ​​download counts of ​scoped packages as well.

The next API that's being used is a special the GitHub raw files API. To find the filename of a changelog, we set up a [promise-rat-race](https://yarnpkg.com/en/package/promise-rat-race) (a very similar alternative is [p-any](https://yarnpkg.com/en/package/p-any), which is like a [Promise.race](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), but it only resolves with the first success value, not with the first value regardless. We di this because there are *​lots* of different ways a changelog can be called. These are different capitalized versions of ChangeLog, Changes or History, as well as with and without ` .md` extension. This brings [the list](https://github.com/algolia/npm-search/blob/b55b8e0a3d2625a7ae791399b813d01751df65c3/github.js#L23-L38) to:
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

​Another very useful ​piece of metadata is know​ing which packages trust a ​certain package so much that they depend on it themselves​. This data is available with the `skimdb` dependedUpon view. Here we can only get a number, which is a reasonable tradeoff, since some packages have *lots* and *lots* of dependents. One of the ways to improve the detail view even further is finding the way npm shows a list that can be paginated of these dependent​s, so that we ​can use it​ to fetch a list of the ​dependents frontend, rather than a static number.

Getting the downloads, changelog filename and the other metadata is only done ​during the bootstrap phase and ​when a package has a new version. Si​nce sometimes packages can get ​significantly more used in a shorter period of time, we ​save when th​e bootstrap phase last completely finished. If​ at any ​change in a package we notice that the bootstrap is more than a set time ago (​right now it is a week)​, the process will exit and​ t​he bootstrap is marked as not completed yet. Then the process, which runs o​n a Heroku worker will automatically restart.

### Schema

In the end we achieve a schema that looks like this for repositories with all data:

```js
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
  "readme": "# babel-core\n> Babel compiler core.\n [...]", // truncated at 200kb with **TRUNCATED**
  "owner": { // either GitHub owner or npm owner
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
  // todo: add newer things like changelog
  "lastCrawl": "2017-04-01T13:41:14.220Z",
  "popularName": "babel-core",
  "dependents": 3321,
  "humanDependents": "3.3k",
  "changelogFilename": null, // if babel-core had a changelog, it would be the raw GitHub url here
  "objectID": "babel-core"
}
```

We also configured two of those attributes as [`attributesForFaceting`](https://www.algolia.com/doc/guides/searching/faceting/#declaring-attributes-for-faceting): `owner.name` and `keywords`. This means that if you're searching for packages within a certain owner, for example `sindresorhus` or with a keyword like `angular` you'll be able to only get results that are relevant to you.

### Detail page

To make the detail page, we wanted some information that was harder to crawl for a huge dataset as the complete registry, using the GitHub and unpkg APIs: 

1. complete changelog
2. commit activity
3. stargazers
4. files available

The changelog is fetched by looking at the package's `changelogFilename` attribute, which is the raw GitHub url. After that is fetched, it's rendered just like the README.

The stargazers and commit activity are fetched with the GitHub API without a specific logged in user; we do this because it proved to have high enough limits for most usages. I only hit into situations where we reached the API limit when needing to reload a lot when developing on the detail page. If this proves to happen more often, we could add a 

## What it means for the community

What we currently made for the Yarn website is a proof of concept. We believe in the power of community and allow anyone to use the search index made by us to be used for logical or off-the-charts 🆒 ideas.

Right now we don't have an automated system for giving out API keys yet, but you can request one by [filling out the form](//todo: the form). You will then get an Algolia API key for the search index with `search` and `browse` as capabilities. You can read more about how to use this on the [main documentation](https://www.algolia.com/doc/) of Algolia.

// todo: button
<a href="" class="btn">Request an API key here</a>

There are already two other projects made with the packages API:

### Atom Autocomplete Module Import
➡️ [GitHub](https://github.com/algolia/atom-autocomplete-module-import)
➡️ [Atom marketplace](https://atom.io/packages/autocomplete-module-import)
➡️ [blogpost]()

![importing a package with atom npm autocomplete](https://camo.githubusercontent.com/53350e9c6d303f60101e1644605fe62f529e45f2/687474703a2f2f672e7265636f726469742e636f2f643576695542385859372e676966)

This was made by two colleagues at Algolia, [Gianluca](https://twitter.com/proudlygeek) and [Raymond](https://twitter.com/rayrutjes) after having the idea during a Happy Hour. It allows you to search for packages inline in your editor, and install it with Yarn or npm.

### jsDelivr search
➡️ [live](https://www.jsdelivr.com)
➡️ [GitHub](https://github.com/jsdelivr/www.jsdelivr.com)

// todo: gif
![searching on jsDelivr]()

jsDelivr is free CDN for all packages on npm. They have been using Algolia since before this index existed, but switched to reuse this index when they switched to their [new architecture]().
