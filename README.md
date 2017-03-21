StorylineJS is a prototype tool to make it easy to provide a narrative context for time series data.

In its initial form, StorylineJS has some key limitations, because we wanted to create something we could share for testing and feedback. If you're a fan of our more finished, ready-to-use software, you may need to have some patience while we work through the next phase.

Limitations:
* StorylineJS only works with time series data. The x-axis should be string values parseable as dates. The y-axis can be any number.
* For now, StorylineJS needs to read the data from a CSV file that it can load from a URL. We expect eventually to also support Google Sheets, and possibly other structured sources.
* This means that for now, you need to run a local web server to experiment with StorylineJS.

ROADMAP
-------
In our current cycle (ending mid-March 2017), we are trying to get a prototype which can be tested in a browser with a variety of datasets. We want to find the edge cases that test the design concepts developed in the Fall 2016 Knight Lab Studio Class and identify any hard challenges in presentation.

If this prototype is promising, we'll consider also developing an authoring tool to make it easier for people to create embeddable storylines.


# Trying it out
In this stage of StorylineJS's development, you must write some javascript, including your own configuration file, and you must run a local webserver to preview your work. Read on for more info.

## Running a local webserver

If you really don't know what this means, it may be too early for you to do much with StorylineJS. Typically we use node's `http-server` or python's `python -m SimpleHTTPServer` or `python3 -m http.server`

## The simplest test


Much like our other tools, you instantiate a storyline with two arguments: the ID of a DOM element which will contain the rendered storyline, and a configuration object which provides the details. If you prefer, you can use a URL in place of the configuration object. The URL should point to a JSON file which will be retrieved. Details on the Config object/JSON file format are below.

Here is the simplest possible Storyline you could create. Put this in an HTML file, run a local server, and load it. You should see a simple example based on a config file and data set which are on our servers.

```
<script src="https://cdn.knightlab.com/libs/storyline/latest/js/storyline.js"></script>
<link rel="stylesheet" href="https://cdn.knightlab.com/libs/storyline/latest/css/storyline.css">

<div id="my-storyline" width="500" height="500"></div>
<script>
  var config_url = 'https://cdn.knightlab.com/libs/storyline/latest/assets/example.json';
  var storyline = new Storyline('my-storyline', config_url);
</script>
```

## Roll your own

If you have the above working, you can go on to make your own configuration file. If you put it in the same directory as your test HTML file, then the `config_url` can just be the filename, without the `http` part.

In addition to your configuration file, you'll need a CSV data file. At a minimum, the file must have two columns: one for dates, which should be unique (there should only be one row for each date) and one for the value which should be plotted on the chart for the corresponding date. You can have other columns, but they'll be ignored.

*TODO* Articulate configuration fields available.

DEVELOPING
----------
After checking out the repository, run

    npm install
    npm run start

This should get you a locally running webserver which supports viewing a sample storyline and which supports automatic recompilation as code changes.
