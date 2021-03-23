StorylineJS is a tool to make it easy to tell the story behind time-series data.

ROADMAP
-------
As of September, 2017, StorylineJS is considered ready for general use. We don't have an active roadmap for further development at this time. However, we'd love to hear from you about what works and what could be better. In general, the best way to reach us is through our [online support system](https://knightlab.zendesk.com/hc/en-us).

# Trying it out
The easiest way to use StorylineJS is by creating embeds using the authoring tool at https://storyline.knightlab.com  Hopefully you can just copy the embed code into your CMS and publish a storyline that easily. More instructions on actually using the tool are on that page.

If you're a more experienced developer, you can also include the StorylineJS and CSS in your web page and write a little javascript to instantiate the storyline and place it on your page. However, note that as of 30 September, 2020, this will be harder to do: Google is decommissioning the original API which allowed StorylineJS to read data from your Sheets documents. For somewhat complex technical reasons, the solution we implemented requires that Sheets documents be read through a proxy server. Knight Lab is not able to provide a general purpose proxy server; the one we have implemented only works with storylines built with our authoring tool and hosted on our systems. 

If it's important to you to host a storyline without using our iframe embeds and you need more information about this, [open a GitHub issue](https://github.com/NUKnightLab/storyline/issues/new/choose).

## Roll your own

If you have the above working, you can go on to make your own configuration JSON file. If you put it in the same directory as your test HTML file, then the `config_url` can just be the filename, without the `http` part.

In addition to your configuration file, you'll need a CSV data file. At a minimum, the file must have two columns: one for dates or times, which should be unique (that is, there should only be one row for each date) and one for the value to be plotted on the chart for the corresponding date. You can have other columns, but they'll be ignored.

It may be easier to look at/copy from an existing data file (like [the one mentioned above](https://github.com/NUKnightLab/storyline/blob/master/src/assets/example.json)), but here are details about the format:

* the file should be a JSON file. Remember that JSON is particular: all your strings must be quoted with double-quote characters, and you may not have a comma after the last property in an "object" (associative array). Try a [JSON validator](http://jsonlint.com/) if you get errors.
* At the "top level" of the JSON object, you will have three required "keys" and one optional key:
  * `data`: an `object` describing details about your data file
  * `chart`: an `object` with details about how your data is presented
  * `cards`: an `array` of `objects`, each of which annotates one data point
  * `start_at_card` *(optional)*:  a number indicating which of your cards should be shown first. The number is "zero-based," as is common in programming. The default (if you leave it out) is `0` (that is, your first card).

Here are more details about those:

`data`: an `object` with the following "keys," all required.
* `url`: a `string` that is the URL to your CSV data file. No other formats are supported at this time. If a "relative" URL is used, it will be interpreted relative to the page hosting your storyline, which may not be the same as relative to your datafile. StorylineJS ignores all columns in the CSV data file except the date and data columns identified below.
* `datetime_column_name`: a `string` that is the value in the first row of the column containing the dates for the X-coordinates of the chart. This is case-sensitive and white-space sensitive.
* `datetime_format`: a `string` that tells StorylineJS how to interpret the value in your datetime_column. The format should be as specified with [`d3-time-format`](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)
* `data_column_name`: a `string` that is the value in the first row of the column of your file which has the values to be used for the Y-coordinates of the chart. This is case-sensitive and white-space sensitive.

`chart`: an `object` with the following keys:

* `datetime_format`: a `string` telling StorylineJS how to display dates, used mostly for the X-axis labels, but also used for cards if no `display_date` is specified. The format should be as specified with [`d3-time-format`](https://github.com/d3/d3-time-format/blob/master/README.md#locale_format)
* `y_axis_label` *(optional)*: Use this to indicate the units for the Y values in your chart. If this is left out, then `data.data_column_name` will be used.

`cards`: an `array` of `objects`, each with the following keys:
* `title`: a brief "title" for the annotation.
* `text`: the main paragraph of your annotation. Keep this under about 222 characters for optimal mobile presentation.
* `row_number`: the row in your CSV file that this card explains. Note that if you're looking at your data in Excel or a text editor with line numbers, the correct value here will be 2 less than the row number your editor shows. This is because we start counting with 0 instead of 1, and because we don't count the header row. We know this is a pain. It's something we hope to change as StorylineJS evolves.
* `display_date` *(optional)*: if this is specified, it will be displayed in the "date" portion of your card. If it is left out, the date value for the appropriate data row will be formatted using `chart.datetime_format` (specified above). You might want to override the default if you want different formats for your axis than for your cards, or if your datapoints are years, for example, but you want to specify a specific month or date in that year.




DEVELOPING
----------
If you're interested in working on this code, see [DEVELOPING.md](DEVELOPING.md)
