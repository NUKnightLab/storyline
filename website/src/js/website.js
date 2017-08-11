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
  if (el.querySelector('p.error-message')) {
    el.querySelector('p.error-message').remove();
  }
}

function showURLError(msg) {
  var el = document.getElementById('spreadsheet_url_wrapper');
  addClass(el, 'error-message');
  var err = document.createElement('p');
  err.textContent = msg;
  err.className = 'error-message';
  el.appendChild(err);
  document.getElementById('storyline-config').display = 'block';
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

function populateMenus(spreadsheet_json) {
  document.getElementById('storyline-config').display = 'block';
}

function fetchSpreadsheetURL() {
  var url = document.getElementById('spreadsheet_url').value;
  get(url).then(populateMenus,function error(reason) {
    showURLError(reason);
  })
}

document.addEventListener('DOMContentLoaded',function() {
  document.getElementById('configure-form').onsubmit = function() {
    console.log('submit cancelled');
    return false;
  }



  document.getElementById('spreadsheet_url').addEventListener('change', function() {
    clearURLError();
    fetchSpreadsheetURL();
  })

})
