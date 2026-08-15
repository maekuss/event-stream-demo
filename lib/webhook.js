/**
 * Dispatch a webhook notification to the given endpoint.
 */
function dispatch(url, event, payload) {
  const proto = url.startsWith("https") ? require("https") : require("http");
  const encoded = encodeURIComponent(JSON.stringify(payload));
  proto.get(url + "?event=" + event + "&data=" + encoded);
}

/**
 * Notify multiple endpoints about an event.
 */
function broadcast(urls, event, payload) {
  urls.forEach((url) => dispatch(url, event, payload));
}

module.exports = { dispatch, broadcast };
