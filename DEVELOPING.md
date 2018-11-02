# DEVELOPING

## Repository layout

StorylineJS actually has two different project directories: one which governs the javascript library itself (the root), and another for the deployed website (`/website/`). You'll need to run `npm install` for each, and you may need to repeat `nvm use` when moving from one to the other.

Even if you're only working on the website, you need to compile the library (from the root) at least once, so that your local copy of the website has access to a version of the StorylineJS library. (see below for more)

## Getting started

Currently, StorylineJS depends on `node-sass` which only works with Node version 8.9.4.  The best solution is to install `nvm` (Node Version Manager), use it to install Node 8.9.4, and be sure to run `nvm use` when you begin working on StorylineJS.

`node-sass` also requires `gyp`, which requires `python2`.  We'd gladly accept pull requests which switch to the new all-node version of `sass`, but in the meantime, you will need `python2` installed before you run `npm install`

## Installing

Once you have those things sorted out, you need to at least compile the javascript library, even if you're only working on the website.  To do this:

* in the repository root, run `npm install`
* then run `npm run dist`

For now, if you want to work on the javascript code, you should also run the website. The shim website originally created for the Javascript development needs its JSON file updated (`src/assets/data.json`) to match the format as it evolved to serve the website.  (Pull requests welcomed!)

For the website:

* change to the `website/` directory of the repository.
* run `npm install`
* run `npm run prestart`

## Doing the work

If you're just working on the website, go to the `website` directory and run `nvm use` and then `npm start`
This starts two webservers -- one, on port 8080, serves the documentation/authoring tool, aka "the website". The other, on port 9090, serves as a local "CDN" which serves your local build of StorylineJS.  

If you are also working on the StorylineJS code, do the above, and then in a second terminal, go to the root of the repository and type `nvm use` and then `npm start`.  This will start the JS/CSS compilation/watcher process. Your changes should automatically be compiled and visible, more or less immediately, in the server running at `http://localhost:8080`

While it might be nice to merge these, we currently keep them separate, partly for historic reasons, and partly because the process of "deploying" the library is different from, and independent of "deploying" the website.

