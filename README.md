StorylineJS is a prototype tool to make it easy to tell the story behind time-series data.

In its initial form, StorylineJS has some limitations--we're sharing this for testing and feedback. If you're a fan of our more finished, ready-to-use software, please be patient while we work through the next phase.

Limitations:
* StorylineJS works only with time series data. The x-axis should be string values parseable as dates. The y-axis can be any number.
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

If you have the above working, you can go on to make your own configuration JSON file. If you put it in the same directory as your test HTML file, then the `config_url` can just be the filename, without the `http` part.

In addition to your configuration file, you'll need a CSV data file. At a minimum, the file must have two columns: one for dates, which should be unique (that is, there should only be one row for each date) and one for the value which should be plotted on the chart for the corresponding date. You can have other columns, but they'll be ignored.

It may be easier to look at/copy from an existing data file (like [the one mentioned above](https://github.com/NUKnightLab/storyline/blob/master/src/assets/example.json)), but here are details about the format:

* the file should be a JSON file. Remember that JSON is particular: all your strings must be quoted with double-quote characters, and you may not have a comma after the last property in an "object" (associative array). Try a [JSON validator](http://jsonlint.com/) if you get errors.
* At the "top level" of the JSON object, you will have three required "keys" and one optional key:
  * `data`: an `object` describing details about your data file
  * `chart`: an `object` with details about how your data is presented
  * `cards`: an `array` of `objects`, each of which annotates one data point.
  * `start_at_card` *(optional)*:  a number indicating which of your cards should be shown first. The number is "zero-based," as is common in programming. The default (if you leave it out) is `0` (that is, your first card).

Here are more details about those:

`data`: an `object` with the following "keys," all required.
* `url`: a `string` which is the URL to your CSV data file. No other formats are supported at this time. If a "relative" URL is used, it will be interpreted relative to the page hosting your storyline, which may not be the same as relative to your datafile. StorylineJS ignores all columns in the CSV data file except the date and data columns explained below.
* `datetime_column_name`: a `string` which is the value in the first row of the column of your file which has the dates to be used for the X-coordinates of the chart. This is case-sensitive and white-space sensitive.
* `datetime_format`: a `string` guiding StorylineJS about how to convert the value in your datetime_column into an actual date. The format should be as specified with [`d3-time-format`](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)
* `data_column_name`: a `string` which is the value in the first row of the column of your file which has the values to be used for the Y-coordinates of the chart. This is case-sensitive and white-space sensitive.

`chart`: an `object` with the following keys:

* `datetime_format`: a `string` guiding StorylineJS about how to display dates, used mostly for the X-axis labels, but also used for cards if no `display_date` is specified. The format should be as specified with [`d3-time-format`](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)
* `y_axis_label` *(optional)*: Use this to indicate the units for the Y values in your chart. If this is left out, then `data.data_column_name` will be used.

`cards`: an `array` of `objects`, each with the following keys:
* `title`: a brief "headline" for the annotation.
* `text`: the main details of your annotation. Keep this under about 222 characters for optimal mobile presentation.
* `row_number`: the row in your data which this card explains. Note that if you're looking at your data in Excel or a text editor with line numbers, the correct value here will be 2 less than the row number your editor shows. This is because we start counting with 0 instead of 1, and because we don't count the header row. This is something which will likely change as StorylineJS evolves.
* `display_date` *(optional)*: if this is specified, it will be used in the "date" portion of your card. If it is left out, the date value for the appropriate data row will be formatted using `chart.datetime_format` (specified above). You might want to override the default if you want different formats for your axis than for your cards, or if your datapoints are, for example, years, but for your annotations, you want to specify a specific month or date in that year.


DEVELOPING
----------
After checking out the repository, run

    npm install
    npm run start

This should get you a locally running webserver which supports viewing a sample storyline and which supports automatic recompilation as code changes.
