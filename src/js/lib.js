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
            req.onerror = function(e) {
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



    return {
        onResize: onResize,
        onLoad: onLoad,
        get: get
    }
})();

export { lib }