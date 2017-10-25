---
id: docs_reusing_yarn_search
guide: docs_reusing_yarn_search
title: Reusing the search engine for Yarn
layout: guide
---

The Yarn search engine is provided as a service free of charge by [Algolia](https://www.algolia.com). This means that you can use any API client or library that works with Algolia.

<div class="row">
  <form class="col-md-8 offset-md-2" data-netlify="true" name="search-request" action="thank-you">
    <div class="form-group">
      <label for="email">email</label>
      <input type="email" class="form-control" name="email" id="email" required />
    </div>
    <div class="form-group">
      <label for="name">name</label>
      <input type="text" class="form-control" name="name" id="name" required />
    </div>
    <div class="form-group">
      <label for="usage">What do you plan to use it for (optional) </label>
      <textarea class="form-control" id="usage" name="usage" rows="3"></textarea>
    </div>
      <div class="form-group">
      <input type="submit" class="form-control" value="Submit ⚡️" />
    </div>
  </form>
</div>

The API key will be sent to you via email, and can be used for searching and browsing the `npm-search` index on the appId `OFCNCOG2CU`. All documentation can be found on [algolia.com/doc](https://www.algolia.com/doc/).

Some ideas for projects are: `yarn add-interactive` on the cli, a searchable list of your own projects, integrations for your editor ...
