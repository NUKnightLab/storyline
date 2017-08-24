var smoothScroll = require('smoothscroll');
var fetch_promise = null;

function valid_google_url(url) {
  // https://docs.google.com/spreadsheets/d/1Io856DYJmMrZrYgVAfxPdHRnTBrLlmGjJUKWbttp7Zs/edit#gid=0
  if (url.match(/.+\/spreadsheets\/d\/(.+?)\//)) {
    return true;
  } else if (url.indexOf('/') == -1) {

  }
  return false;
}

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
    el.className=el.className.replace(reg, ' ')
  }
}

function clearURLError() {
  var el = document.getElementById('spreadsheet_url_wrapper');
  removeClass(el, 'error-message');
  pruneChildren(el, 'p.error-message');
}

function createErrorParagraph(msg) {
  var err = document.createElement('p');
  err.textContent = msg;
  err.className = 'error-message';
  return err;
}

function showURLError(msg) {
  var el = document.getElementById('spreadsheet_url_wrapper');
  addClass(el, 'error-message');
  el.appendChild(createErrorParagraph(msg));
  document.getElementById('storyline-config').display = 'block';
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
      if(req.status == 200) {
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
    } catch(e) {
      console.log('lib.get req.send error', e)
      reject(e);
    }
  })
}

function extractColumnHeaders(spreadsheet_json) {
  var e = spreadsheet_json.feed.entry[0];
  var headers = [];
  var entry_keys = Object.keys(e);
  for (var i = 0; i < entry_keys.length; i++) {
    if (entry_keys[i].indexOf('gsx$') == 0) {
      headers.push(entry_keys[i].substr(4));
    }
  }
  return headers;
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
  addClass(btn,'button-disabled');
}
function enableLoadButton() {
  var btn = document.getElementById('load-btn');
  removeClass(btn,'button-disabled');
  addClass(btn, 'button-secondary'); // yuk for hard-coding which kind of button it is
}

function setCSSProperty(selector, property, value) {
  var elements = document.querySelectorAll(selector);
  for (var i = 0; i < elements.length; i++) {
    elements[i].style[property] = value
  }
}

function populateMenusAndShowForm(feed_response_str) {
  var spreadsheet_json = JSON.parse(feed_response_str);
  var columns = extractColumnHeaders(spreadsheet_json);

  var config_area = document.getElementById('storyline-config');
  var selects = config_area.querySelectorAll('select.column-selector');
  for (var i = 0; i < selects.length; i++) {
    addSelectOptions(selects[i], columns);
  }

  enableLoadButton();
  setCSSProperty('.hide-without-data', 'display', 'block');
  validateConfigForm();
  fetch_promise = null;
}

function validateRequiredInput(el) {
  var valid = true;
  clearInputError(el);
  if (el.value) {
    // TODO: ensure unique?
    valid = true;
  } else {
    showInputError(el, 'required');
    valid = false;
  }
  return valid;
}

function validateConfigForm() {
  var btn = document.getElementById('generate-storyline-btn');
  removeClass(btn, 'button-secondary'); // yuk for hard-coding which kind of button it is
  addClass(btn,'button-disabled');
  var valid = true;
  var selections = [];
  var config_area = document.getElementById('storyline-config');
  var selects = config_area.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++) {
    valid = validateRequiredInput(selects[i]) && valid;
  }

  valid = validateRequiredInput(document.getElementById('data_axis_label')) && valid;

  if (valid) {
    removeClass(btn, 'button-disabled');
    addClass(btn, 'button-secondary'); // yuk for hard-coding which kind of button it is
  }
  return valid;
}

function buildGoogleFeedURL(url) {
    var key;
    // key as url parameter (old-fashioned)
    var key_pat = /\bkey=([-_A-Za-z0-9]+)&?/i;
    var url_pat = /docs.google.com\/spreadsheets(.*?)\/d\//; // fixing issue of URLs with u/0/d

    if (url.match(key_pat)) {
        key = url.match(key_pat)[1];
        // can we get a worksheet from this form?
    } else if (url.match(url_pat)) {
        var pos = url.search(url_pat) + url.match(url_pat)[0].length;
        var tail = url.substr(pos);
        key = tail.split('/')[0]
        if (url.match(/\?gid=(\d+)/)) {
            parts.worksheet = url.match(/\?gid=(\d+)/)[1];
        }
    } else if (url.match(/^\b[-_A-Za-z0-9]+$/)) {
        key = url;
    }

    if (key) {
      return `https://spreadsheets.google.com/feeds/list/${key}/1/public/values?alt=json`;
    }
    return null;
}

function fetchSpreadsheetURL() {
  if (fetch_promise) {
    showURLError("Already working on it cool yr jets");
    return;
  }
  var url = document.getElementById('spreadsheet_url').value;
  var feed_url = buildGoogleFeedURL(url);
  if (feed_url) {
    fetch_promise = get(feed_url).then(populateMenusAndShowForm,function error(reason) {
      showURLError(reason);
      fetch_promise = null;
    })
  } else {
    showURLError("Invalid Google Spreadsheet URL");
  }
}

function processSpreadsheetURL() {
  clearURLError();
  setCSSProperty('.hide-without-data', 'display', 'none');
  disableLoadButton();
  fetchSpreadsheetURL();
}

function buildStorylineUrl() {
  var paramMap = {
      dataURL: document.getElementById('spreadsheet_url').value,
      dataYCol:  document.getElementById('data_column_name').value,
      dataXCol: document.getElementById('datetime_column_name').value,
      dataDateFormat: document.getElementById('datetime_format').value,
      chartDateFormat: document.getElementById('datetime_format').value,
      chartYLabel: document.getElementById('data_axis_label').value,
      // sliderStartCard: "start_at_card",
      sliderCardTitleCol: document.getElementById('title').value,
      sliderCardTextCol: document.getElementById('text').value
  }
  var params = []
  Object.keys(paramMap).map(function(key) {
    var value = paramMap[key];
    params.push(`${key}=${encodeURIComponent(value)}`);
    smoothScroll(document.getElementById('make-step-share'));
  });
  return `${EMBED_URL}?${params.join('&')}`;
}

function handleGenerateButtonClick() {
  var msg_el = document.getElementById('config-wrapper-message');
  pruneChildren(msg_el, 'p.error-message');
  if (validateConfigForm()) {
    var embed_url = buildStorylineUrl();
    document.querySelector('#preview-embed-iframe iframe').src = embed_url;
    var textarea = document.getElementById('embed-code-textarea');
    textarea.value = document.getElementById('preview-embed-iframe').innerHTML.trim();
  } else {
    msg_el.append(createErrorParagraph("Please correct the errors on the form before submitting"));
  }
}

document.addEventListener('DOMContentLoaded',function() {
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

})

module.exports = {
  validateConfigForm: validateConfigForm
}
