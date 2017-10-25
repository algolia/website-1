---
id: docs_reusing_yarn_search
guide: docs_reusing_yarn_search
title: Reusing the search engine for Yarn
layout: guide
---

The Yarn search engine is provided as a service free of charge by [Algolia](https://www.algolia.com). This means that you can use any API client or library that works with Algolia.

// todo: make handler for email
<form action="netlify-send-me-an-email">

// todo: styling
<label for="email">email</label>
<input type="email" name="email" id="email" required />

<label for="name">name</label>
<input type="text" name="name" id="name" required />

<label for="usage">What do you plan to use it for</label>
<input type="text" name="usage" id="usage" required />

<label for="referer">referers (optional, separated by a comma)</label>
<input type="text" name="referer" id="referer" pattern="((https?://.*)(,))+"/>

<input type="submit" value="Submit ⚡️" />

</form>

The API key will be sent to you via email, and can be used for searching and browsing the `npm-search` index on the appId `OFCNCOG2CU`. All documentation can be found on [algolia.com/doc](https://www.algolia.com/doc/).

Some ideas for projects are: `yarn add-interactive` on the cli, a searchable list of your own projects, integrations for your editor ...

Enjoy your day ✨
