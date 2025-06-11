import { Chart } from './chart';
import { DataFactory } from './data';
import { Slider } from './slider';
import ua from 'universal-analytics'

/**
 * Instantiate a storyline
 *
 * @param {string} targetId - a DOM element ID indicating the container for the StoryLine.
 * @param {object|string} dataConfig - a JS object or url which defines the data source and other config options
 * @returns {undefined}
 */
export class Storyline {

    static fetchHeaders(dataConfig) {
        return DataFactory.fetchHeaders(dataConfig)
    }

    constructor(targetId, dataConfig) {
        this.elem = document.getElementById(targetId);
        this.elem.className += 'storyline-wrapper'
        try {
            var self = this;
            self.dataConfig = dataConfig
            self.init()
        } catch (e) {
            this.showMessage("Error!");
            console.log(e);
        }
    }
    init() {
            var self = this;
            this.initTracking();
            this.validateConfig(this.dataConfig);
            this.setDimensions();
            this.grabData(this.dataConfig).then(function(dataObj) {
                    self.data = dataObj;
                    self.chart = self.initChart(dataObj);
                    self.slider = self.initSlider();
                    self.positionChart(self.chart)
                    self.positionSlider(self.slider)
                },
                function(reason) {
                    var msg = reason.message || "Something went wrong.";
                    self.showMessage(`${msg}`)
                    console.log("Storyline init error", reason);
                });
            PubSub.subscribe('window resized', function(topic, data) {
                self.resetWidth(data, 'window');
            })
        }
        /**
         * Perform any necessary data validation or cleanup ASAP so we can error out cleanly if things won't work.
         * @TODO There are almost definitely more checks to add here.
         */
    validateConfig(config) {
        var self = this
            // we need chart.datetime_format for the x axis and for cards so use input datetime format as a fallback.
        Object.keys(config).map(function(thing) {
            Object.keys(config[thing]).map(function(con) {
                if (config[thing][con].indexOf('%25') > -1) {
                    self.dataConfig[thing][con] = self.dataConfig[thing][con].replace(/%25/g, "%")
                } else if (config[thing][con].indexOf('%20') > -1) {
                    self.dataConfig[thing][con] = self.dataConfig[thing][con].replace(/%20/g, " ")
                } else if (config[thing][con].indexOf('"') > -1) {
                    self.dataConfig[thing][con] = self.dataConfig[thing][con].replace(/"/g, "")
                }
            })
        })
        if (!config.chart) { this.dataConfig.chart = {} }
        if (!config.chart.datetime_format) { this.dataConfig.chart.datetime_format = this.dataConfig.data.datetime_format }

    }
    initTracking() {
        try {
            var visitor = ua('UA-27829802-5', { https: true });
            visitor.pageview({ dl: document.location.href }).send();
            this.visitor = visitor;
        } catch (e) { /* we don't want any problem here to sidetrack things */ }
    }
    trackEvent(category, action, label, value) {
        if (this.visitor) {
            this.visitor.event(category, action, label, value).send();
        }
    }
    resetWidth(newWidth, targetType) {
        if (this.slider && this.slider.elem && this.chart && this.chart.canvas) {
            this.trackEvent('resize', targetType)
            this.width = newWidth;
            var oldSlider = this.slider.elem
            var lastActiveCard = this.slider.activeCard;
            var oldChart = this.chart.canvas
            oldSlider.remove();
            oldChart.remove();
            this.chart = this.initChart(this.data)
            this.slider = this.initSlider(lastActiveCard);
            this.positionChart(this.chart)
            this.positionSlider(this.slider)
        }
    }

    /**
     * Prepare a promise to fetch the data which will be used to draw the chart.
     * @returns {Promise} a promise to deliver a 'dataObject' if successfully resolved. ]
     * @TODO Better document the properties of a `dataObject`
     */
    grabData() {
        var data = new DataFactory;
        return data.fetchSheetData(this.dataConfig);
    }
    initSlider(lastActiveCard) {
        var activeCard = !!lastActiveCard ? lastActiveCard : !!this.data.activeCard ? this.data.activeCard : 0
        var sliderHeight = (0.4 * this.height)
        return new Slider(this, this.chart.markers, this.data.cards, this.dataConfig, activeCard, sliderHeight, this.width);
    }
    initChart(dataObj) {
            var chartHeight = !!this.chartHeight ? this.chartHeight : (0.6 * this.height);
            return new Chart(this, dataObj, this.width, chartHeight, this.margin)
        }
        /**
         * checks browser size and if mobile, overrides input dimensions
         *
         * @returns {undefined}
         */
    setDimensions(width) {
        this.width = width ? width : window.innerWidth;
        this.height = this.elem.getAttribute('height');
        //slider has a max height of 246px so let chart take up the additional space//
        if (0.4 * this.height > 246) {
            this.chartHeight = this.height - 246;
        }
    }
    showMessage(msg) {
        var mustache = require('mustache');

        var errorMessageElem = this.elem.querySelector('.error-message')
        var hasErrorMessage = errorMessageElem != null
        if (hasErrorMessage) {
            errorMessageElem.innerHTML = msg;
        } else {
            const template =
                "<div class='error'>" +
                "<div class='error-message'>{{ msg }}</div>" +
                "</div>"
            var rendered = mustache.render(template, { msg: msg }),
                parser = new DOMParser(),
                doc = parser.parseFromString(rendered, "text/html");
            this.elem.append(doc.body.children[0]);
        }
    }
    hideMessage() {
        var err = this.elem.querySelector('.error');
        if (err) {
            this.elem.removeChild(err);
        }
    }
    attr(dimension, value) {
        if (dimension == "height") {
            this.height = value;
            this.elem.style.height = value + "px";
        } else if (dimension == "width") {
            this.width = value;
            this.elem.style.width = value + "px";
        } else if (dimension == "margin") {
            this.margin = value;
        }
    }

    positionChart(chart) {
        this.elem.appendChild(chart.canvas);
    }

    positionSlider(slider) {
        this.elem.appendChild(slider.elem);
    }

    attachClickHandler(div, targetType) {
        this.trackEvent('click', targetType)
        var self = this;
        for (var i = 0; i < div.length; i++) {
            div[i].onclick = function(event) {
                self.handleClick(event, targetType);
            }
        }
    }
    handleClick(event, targetType) {
        this.trackEvent('click', targetType)
        var classes = event.target.classList;

        for (var i in classes) {
            if (classes[i].indexOf("-") != -1) {
                var currentActiveCard = parseFloat(classes[i].split("-")[1]);
                this.slider.goToCard(currentActiveCard)
                return false;
            }
        }
    }
}
