var smoothScroll = require('smoothscroll');
const { DataFactory } = require('../../../src/js/data');
const { Storyline } = require('../../../src/js/storyline');
var fetch_promise = null;

function hasClass(el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ')
    }
}


function createErrorParagraph(msg) {
    var err = document.createElement('p');
    err.textContent = msg;
    err.className = 'error-message';
    return err;
}

function clearURLError() {
    var el = document.getElementById('spreadsheet_url_wrapper');
    removeClass(el, 'error-message');
    pruneChildren(el, 'p.error-message');
    el = document.getElementById('spreadsheet_url_message')
    pruneChildren(el, 'p.error-message');
}

function showURLError(msg) {
    var el = document.getElementById('spreadsheet_url_wrapper');
    addClass(el, 'error-message');
    el = document.getElementById('spreadsheet_url_message')
    el.appendChild(createErrorParagraph(msg));
}

function clearInputError(el) {
    removeClass(el, 'error-message');
    pruneChildren(el.parentElement, 'p.error-message');
}

function showInputError(el, msg) {
    addClass(el, 'error-message');
    el.parentElement.appendChild(createErrorParagraph(msg));
}

function get(url) {
    return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("GET", url, true);
        req.onload = function() {
            if (req.status == 200) {
                resolve(req.response)
            } else {
                reject(Error(req.statusText))
            }
        }
        req.onerror = function() {
            console.error(`lib.get: Error fetching ${url}`);
            reject(Error(`Network Error`));
        }
        try {
            req.send();
        } catch (e) {
            console.log('lib.get req.send error', e)
            reject(e);
        }
    })
}

/**
 * For any config menus we want to preselect, add the menu's id
 * paired with a regular expression. As column headers are added to the config menus,
 * they'll be tested against the regex. If there's a match, they'll be set to selected.
 */
const OPTION_SELECTED_HEURISTICS = {
    datetime_column_name: /^(date|time)$/i,
    title: /^\s*title\s*$/i,
    text: /^\s*text\s*$/i
}

function pruneChildren(el, query) {
    var kids = el.querySelectorAll(query);
    for (var i = 0; i < kids.length; i++) {
        el.removeChild(kids[i]);
    }
}

function addSelectOptions(el, values) {
    pruneChildren(el, 'option');
    var o = document.createElement('option');
    o.text = '-- select --';
    o.value = '';
    el.add(o);
    for (var i = 0; i < values.length; i++) {
        o = document.createElement('option');
        o.text = values[i];
        el.add(o);
        if (OPTION_SELECTED_HEURISTICS[el.id] && values[i].match(OPTION_SELECTED_HEURISTICS[el.id])) {
            o.selected = true;
        }
    }
}

function disableLoadButton() {
    var btn = document.getElementById('load-btn');
    removeClass(btn, 'button-secondary'); // yuk for hard-coding which kind of button it is
    addClass(btn, 'button-disabled');
}

function enableLoadButton() {
    var btn = document.getElementById('load-btn');
    removeClass(btn, 'button-disabled');
    addClass(btn, 'button-secondary'); // yuk for hard-coding which kind of button it is
}

function setCSSProperty(selector, property, value) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        elements[i].style[property] = value
    }
}

function setFormValue(selector, value) {
    var elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
        elements[i].value = value
    }
}

function getFormValue(selector) {
    return document.querySelector(selector).value;
}



function usingDemoURL() {
    var prefill = document.getElementById('prefill-spreadsheet-url');
    var url_elem = document.getElementById('spreadsheet_url');
    return (url_elem.value.trim() == prefill.dataset.url);
}

function populateMenusAndShowForm(columns) {
    // var spreadsheet_json = JSON.parse(feed_response_str);
    // var columns = extractColumnHeaders(spreadsheet_json);
    var config_area = document.getElementById('storyline-config');
    var selects = config_area.querySelectorAll('select.column-selector');
    for (var i = 0; i < selects.length; i++) {
        addSelectOptions(selects[i], columns);
    }

    if (usingDemoURL()) {
        // yaxis label

        setFormValue('#data_column_name', 'temperaturechange');
        setFormValue('#datetime_column_name', 'year');
        setFormValue('#datetime_format', '%Y');
        setFormValue('#data_axis_label', 'Annual Temp. Change');
        setCSSProperty('#demo-mode-message', 'display', 'block');
    }

    enableLoadButton();
    removeClass(document.querySelector('#storyline-config'), 'hide-without-data');
    removeClass(document.querySelector('#create-button-wrapper'), 'hide-without-data');
    validateConfigForm();
    fetch_promise = null;
}

function validateRequiredInput(el) {
    var valid = true;
    if (el.value) {
        valid = true;
    } else {
        valid = false;
    }
    return valid;
}

function validateConfigForm() {

    var msg_el = document.getElementById('config-wrapper-message');
    pruneChildren(msg_el, 'p.error-message');

    var btn = document.getElementById('generate-storyline-btn');
    removeClass(btn, 'button-secondary'); // yuk for hard-coding which kind of button it is
    addClass(btn, 'button-disabled');
    var valid = true;
    var validations = {
        required_error: false,
        blank_pseudo_error: false,
    }
    var config_area = document.getElementById('storyline-config');
    var selects = config_area.querySelectorAll('select.required');
    for (var i = 0; i < selects.length; i++) {
        let el = selects[i]
        clearInputError(el);
        if (!validateRequiredInput(el)) {
            valid = false;
            validations.required_error = true
        }
        // probably shouldn't just ride on select.required but 
        // fact is all of those also need this
        if (el.value.indexOf('_c') == 0) {
            valid = false
            validations.blank_pseudo_error = true
            showInputError(el, 'invalid option');
        }
    }
    el = document.getElementById('data_axis_label')
    clearInputError(el);
    if (!validateRequiredInput(el)) {
        valid = false;
        validations.required_error = true
    }

    if (valid) {
        removeClass(btn, 'button-disabled');
        addClass(btn, 'button-secondary'); // yuk for hard-coding which kind of button it is
    }

    if (validations.required_error) {
        // don't show this, it's annoying when this function is triggered on each field change
        // msg_el.append(createErrorParagraph("Please fill in all required fields."));
    }
    if (validations.blank_pseudo_error) {
        msg_el.append(createErrorParagraph("Invalid option: one or more of your choices is a place holder for a blank column header in your spreadsheet. All columns used for Storyline must have non-blank headers."));
    }

    return valid;
}

function fetchSpreadsheetURL() {
    var url = getFormValue('#spreadsheet_url');
    var headers = Storyline.fetchHeaders({
        proxy: PROXY_URL,
        data: { url: url }
    }).then(populateMenusAndShowForm)
}

function processSpreadsheetURL() {
    clearURLError();
    setCSSProperty('#demo-mode-message', 'display', 'none');
    setCSSProperty('#preview-embed', 'display', 'none');
    addClass(document.querySelector('#storyline-config'), 'hide-without-data');
    clearConfigForm();
    addClass(document.querySelector('#create-button-wrapper'), 'hide-without-data');
    disableLoadButton();
    fetchSpreadsheetURL();
}

function clearConfigForm() {
    var form_field_ids = ['#datetime_format', '#data_axis_label', '#card_date_format', '#datetime_format',
        '#data_column_name', '#datetime_column_name'
    ];
    form_field_ids.forEach(function(fid) { setFormValue(fid, '') });
}

function buildStorylineUrl() {
    var paramMap = {
        dataURL: getFormValue('#spreadsheet_url'),
        dataYCol: getFormValue('#data_column_name'),
        dataXCol: getFormValue('#datetime_column_name'),
        dataDateFormat: getFormValue('#datetime_format'),
        chartDateFormat: getFormValue('#card_date_format') || getFormValue('#datetime_format'),
        chartYLabel: getFormValue('#data_axis_label'),
        // sliderStartCard: "start_at_card",
        sliderCardTitleCol: getFormValue('#title'),
        sliderCardTextCol: getFormValue('#text')
    }
    var params = []
    Object.keys(paramMap).map(function(key) {
        var value = paramMap[key];
        params.push(`${key}=${encodeURIComponent(value)}`);
    });
    return `${EMBED_URL}?${params.join('&')}`;
}

function handleGenerateButtonClick() {
    if (validateConfigForm()) {
        var embed_url = buildStorylineUrl();
        document.querySelector('#preview-embed-iframe iframe').src = embed_url;

        setFormValue('#embed-code-textarea', document.getElementById('preview-embed-iframe').innerHTML.trim());
        setFormValue('#direct-link-textarea', embed_url);

        setCSSProperty('#preview-embed', 'display', 'block');
        smoothScroll(document.getElementById('preview-embed'));
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('configure-form').onsubmit = function() {
        console.log('submit cancelled');
        return false;
    }

    document.getElementById('spreadsheet_url').addEventListener('change', processSpreadsheetURL);

    document.getElementById('load-btn').addEventListener('click', processSpreadsheetURL);

    var selects = document.querySelectorAll('select');
    for (var i = 0; i < selects.length; i++) {
        selects[i].addEventListener('change', validateConfigForm);
    }

    document.getElementById('data_axis_label').addEventListener('change', validateConfigForm);

    document.getElementById('generate-storyline-btn').addEventListener('click', handleGenerateButtonClick);

    document.getElementById('prefill-spreadsheet-url').addEventListener('click', function() {
        var url = this.dataset.url;
        setFormValue('#spreadsheet_url', url);
        processSpreadsheetURL();
    })

    document.getElementById('data_column_name').addEventListener('change', function() {
        if (getFormValue('#data_axis_label').trim() == '') {
            setFormValue('#data_axis_label', getFormValue('#data_column_name'));
        }
    })

    document.querySelectorAll('textarea[readonly]').forEach(function(el) { el.addEventListener('click', function() { this.select(); }) })
})

module.exports = {
    validateConfigForm: validateConfigForm
}