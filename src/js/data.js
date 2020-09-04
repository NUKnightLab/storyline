var parse = require('csv-parse/lib/sync');
import { lib } from './lib'
const GOOGLE_SHEETS_URL_PATTERN = new RegExp('(https://docs.google.com/spreadsheets/.+/.+?)/.+', 'i')

export class DataFactory {

    /**
     * runs through data and grabs significant values for drawing line
     *
     * @param {array} dataObj - x and y axis data points
     * @param {object} config -  data object from config file
     * @returns {object} dataObj - data needed for creating a new chart
     */
    createDataObj(dataObj, config) {
        var d3Time = require('d3-time-format');
        var data = [],
            cards = [],
            activeCard,
            bounds = {
                minX: null,
                maxX: null,
                minY: null,
                maxY: null
            },
            axes = {
                yLabel: null,
                timeFormat: null
            },
            markers = [];

        var card_lookup = null;
        if (config.slider.cards != undefined) {
            card_lookup = {}
            for (var i = 0; i < config.slider.cards.length; i++) {
                var card = config.slider.cards[i];
                card_lookup[card.row_number] = card;
            }
        } else {
            var errorMsg = [];
            if (!config.slider.title_column_name) {
                errorMsg.push("No title column specified.");
            }
            if (!config.slider.text_column_name) {
                errorMsg.push("No text column specified.");
            }
            if (errorMsg.length > 0) {
                throw new Error(errorMsg.join('\n'));
            }
        }

        for (var i = 0; i < dataObj.length; i++) {
            var slideTitle = '',
                slideText = '',
                slideActive = false;
            if (!card_lookup) {
                try {
                    slideTitle = dataObj[i][config.slider.title_column_name]
                } catch (e) {
                    throw new Error("Invalid title column.")
                }
                try {
                    slideText = dataObj[i][config.slider.text_column_name]
                } catch (e) {
                    throw new Error("Invalid text column.")
                }
                slideActive = (dataObj[i][config.slider.start_at_card]) ? dataObj[i][config.slider.start_at_card] : false;
            } else if (card_lookup[i]) {
                slideTitle = card_lookup[i].title;
                slideText = card_lookup[i].text;
                if (config.slider.start_at_card) {
                    slideActive = (config.slider.start_at_card == i);
                }
            }
            var datetime_format = config.data.datetime_format;
            var dateParse = d3Time.timeParse(config.data.datetime_format);
            var raw_x = dataObj[i][config.data.datetime_column_name]
            var raw_y = dataObj[i][config.data.data_column_name];
            var x = typeof raw_x === typeof {} ? dateParse(Object.values(raw_x)[0]) : dateParse(raw_x);
            var y = typeof raw_y === typeof {} ? parseFloat(Object.values(raw_y)[0]) : parseFloat(raw_y);
            //check if x or y is undefined or null
            var errorMessages = [];
            if (!(x instanceof Date)) {
                raw_x = typeof raw_x === typeof {} ? Object.values(raw_x)[0] : raw_x;
                errorMessages.push(
                    `The date/time column is invalid, check that the column name ` +
                    `matches your data and that your date format is correct. ` +
                    `[date string: ${raw_x} ; format: ${datetime_format}]`)
            }
            if (isNaN(parseInt(y))) {
                errorMessages.push(`At least one value in the data column (${config.data.data_column_name}) is not a number. check that the column name matches your data`)
            }

            if (errorMessages.length > 0) {
                throw new Error(errorMessages.join('; '))
            }

            bounds.minY = this.getMin(y, bounds.minY)
            bounds.maxY = this.getMax(y, bounds.maxY)
            bounds.minX = this.getMin(x, bounds.minX)
            bounds.maxX = this.getMax(x, bounds.maxX)
            data.push([x, y]);
            axes.timeFormat = config.chart.datetime_format;
            axes.yLabel = config.chart.y_axis_label ? config.chart.y_axis_label : config.data.data_column_name;

            if (slideTitle.length > 0 && slideText.length > 0) {
                var date = x
                var rowNumber = i
                cards.push({ date, slideTitle, slideText, rowNumber })
                markers.push({ rowNumber, date, slideTitle, slideText })
            }
        }

        var dataObj = { data, cards, bounds, axes, markers, activeCard };
        return dataObj;
    }

    /**
     * compares two values and returns the minimum
     *
     * @param {num} var1
     * @param {num} var2
     * @returns {num} smallest num of 2 given numbers
     */
    getMin(var1, var2) {
        if (var1 == null && var2 == null) { throw "Only one value can be null" }
        if (var1 == null) { return var2 }
        if (var2 == null) { return var1 }
        if (var1 < var2) {
            return var1
        } else {
            return var2
        }
    }

    /**
     * compares two values and returns the maximum
     *
     * @param var1
     * @param var2
     * @returns {undefined}
     */
    getMax(var1, var2) {
        if (var1 == null && var2 == null) { throw "Only one value can be null" }
        if (var1 == null) { return var2 }
        if (var2 == null) { return var1 }
        if (var1 > var2) {
            return var1
        } else {
            return var2
        }
    }

    /**
     * Return the URL for retrieving data as a CSV based on the values in `config`. If the URL 
     * is for a Google Sheets document, it reformats it, if necessary, to retrieve a CSV for 
     * the same logical document. Because it may not be possible to retrieve Google Sheets as CSVs 
     * from browser-based JavaScript, if a `proxy` value is provided, it is prepended to the
     * URL.  Otherwise, `data.url` is returned, trusting that it will return a CSV when used.
     *
     * @param {Object} config - a config object with a nested property, `data.url`, and possibly, a `proxy` property
     * @returns {string} the URL to a Google Spreadsheet or a CSV or undefined if various conditions aren't met
     */
    static getCSVURL(config) {
        if (config && config.data) {
            let url = config.data.url
            if (url && url.match(GOOGLE_SHEETS_URL_PATTERN)) {
                let match = url.match(GOOGLE_SHEETS_URL_PATTERN)
                url = `${match[1]}/pub?output=csv`
                if (config.proxy) {
                    url = `${config.proxy}${url}`
                }
            };
            return url
        }
        return null;
    }

    /**
     * fetch data from the csv data using given config parameters
     *
     * @param {object} config - configuration object from json
     * @returns {undefined}
     */
    static fetchHeaders(config) {
        return new Promise(function(resolve, reject) {
            var url = DataFactory.getCSVURL(config) // url could be undefined. handle more deliberately.
            lib.get(url)
                .then(function(response) {
                    if (response) {
                        var rows = parse(response)
                        if (rows && rows.length > 0) {
                            resolve(rows[0])
                        }
                    }
                    reject('No data returned')
                }, function(reason) {
                    reject(`fetchHeaders: ${reason}`);
                })
        })
    }

    fetchSheetData(config, context) {
        var self = context ? context : this;
        return new Promise(function(resolve, reject) {
            var url = DataFactory.getCSVURL(config)
            lib.get(url)
                .then(function(response) {
                    if (response) {
                        try {
                            var formattedResponse, headers;
                            response = response.replace(response.split(/\n/)[0], response.split(/\n/)[0].toLowerCase())
                            formattedResponse = parse(response, { 'columns': true })
                            resolve(self.createDataObj(formattedResponse, config))
                        } catch (e) {
                            if (!e.message) {
                                e = { message: e };
                            }
                            reject(e) // leave error handling to promise caller
                        }
                    }
                }, function(reason) {
                    reject(reason); // leave error handling to promise caller
                })
        })
    }
}

export class DataError {
    constructor(message) {
        this.name = 'DataError';
        this.message = message || '';
        this.stack = (new Error()).stack;
    }

    toString() {
        return this.name + ": " + this.message;
    }

}