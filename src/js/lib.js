var lib = (function() {
    var prevWidth = null;
    /**
     * onresize courtesy of this post: https://www.lullabot.com/articles/importing-css-breakpoints-into-javascript
     *
     * @returns {undefined}
     */
    function onResize() {
        var currentWidth = document.body.clientWidth
        if (prevWidth == undefined) {
            prevWidth = currentWidth;
        } else {
            PubSub.publish('window resized', currentWidth)
            prevWidth = currentWidth
        }
    }

    function onLoad() {
        prevWidth = document.body.clientWidth;
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

    function parseSpreadsheetURL(url) {
        const parts = {
                key: null,
                worksheet: 0 // not really sure how to use this to get the feed for that sheet, so this is not ready except for first sheet right now
            }
            // key as url parameter (old-fashioned)
        var key_pat = /\bkey=([-_A-Za-z0-9]+)&?/i;
        var url_pat = /docs.google.com\/spreadsheets(.*?)\/d\//; // fixing issue of URLs with u/0/d

        if (url.match(key_pat)) {
            parts.key = url.match(key_pat)[1];
            // can we get a worksheet from this form?
        } else if (url.match(url_pat)) {
            var pos = url.search(url_pat) + url.match(url_pat)[0].length;
            var tail = url.substr(pos);
            parts.key = tail.split('/')[0]
            if (url.match(/\?gid=(\d+)/)) {
                parts.worksheet = url.match(/\?gid=(\d+)/)[1];
            }
        } else if (url.match(/^\b[-_A-Za-z0-9]+$/)) {
            parts.key = url;
        }

        if (parts.key) {
            return parts;
        } else {
            return null;
        }
    }

    return {
        parseSpreadsheetURL: parseSpreadsheetURL,
        onResize: onResize,
        onLoad: onLoad,
        get: get
    }
})();

export { lib }