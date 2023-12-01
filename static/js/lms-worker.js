/* ---------------- VARS ---------------- */
const VERSION = 1; // to test forced updates
const API_ADDRESS = "130.245.32.39";
const ENDPOINT_STATUS = `/links/status`; // query the status of a link
const ENDPOINT_STATUSES = `/links/statuses`; // query allowed & blocked links
const ENDPOINT_USAGE = {};

const LMS_MODES = {
  NOOP_SW: 0, // immediately return from request handler
  NOOP_LMS: 1, // immediately return YES, don't do anything
  NORMAL: 2, // normal operation from perspective of SW
};
const COMM_MODES = {
  HTTPS: "https", // use https
  HTTP: "http", // use http
  WS: "ws", // use websockets
};
const HEARTBEAT_INTERVALS = {
  NORMAL: 5000,
  ERRORED: 30000,
};
const MESSAGE_TYPE = {
  RELOAD: "reload",
  REREGISTER: "reregister",
  EXTRACT_LINKS: "extract-links",
  FORCE_ACTIVATE: "force-activate",
  CONFIG_UPDATE: "config-update",
  ACTIVE_TAB: "active-tab",
  UPDATE_MODE: "update-mode",
  ENDPOINT_USAGE: "endpoint-usage",
};
const NULL_BODY = new Set([101, 103, 204, 205, 304]);
const CACHE_NAME = "lms"; // service worker response cache
const CACHE_EXP_HEADER = "sw-fetched-on"; // custom header for fetch timestamp
const CACHE_EXP_MS = 1000 * 60 * 10; // cache entry expiration, 10 mins
const MAX_CONN_ERRS = 3;

const BLOCKED_URLS = {}; // { website URL: query_timestamp }
const ALLOWED_URLS = {}; // { website URL: query_timestamp }
const CACHE_DNS = {}; // ad-hoc DNS cache
const CACHE_LINK_STATUS = {}; // ad-hoc link status cache
const CACHE_FETCH_STATUSES = {}; // ad-hoc fetch statuses cache

let LMS_MODE = LMS_MODES.NORMAL;
let COMM_MODE = COMM_MODES.HTTPS;
let WEBSOCKET = null;
let SOCKET_QUEUE_ID = 0;
let SOCKET_QUEUE = {};
let NUM_CONN_ERRS = 0;
let INTERVAL_DNS = null; // interval object reference for posting DNS resolutions
let INTERVAL_CFG = null; // interval object reference for fetching configs
let CONFIG = {}; // configuration
let ACTIVE_PAGE = null;

/* ---------------- HELPERS ---------------- */

function generateBlockedRequest() {
  return new Response(null, { status: 404 });
}

async function forceRefresh(clients, reregister) {
  const msg = reregister
    ? { type: MESSAGE_TYPE.REREGISTER }
    : { type: MESSAGE_TYPE.RELOAD };
  clients.matchAll().then((clients) => {
    // force a refresh on all pages to ensure consistency
    clients.forEach((client) => client.postMessage(msg));
  });
}

function isSameOrigin(url, cmp) {
  const origin = new URL(url).origin;
  const comparison = cmp ? cmp : self.location;
  return origin == new URL(comparison).origin;
}

function isLocalExtensionLink(url) {
  return url.startsWith("chrome-extension://");
}

function isNullBodyStatus(status) {
  return NULL_BODY.has(status);
}

function setupEndpointUsage() {
  const endpoints = [ENDPOINT_STATUS, ENDPOINT_STATUSES];
  for (const endpoint of endpoints) {
    ENDPOINT_USAGE[endpoint] = 0;
  }
}

setupEndpointUsage();

/* ---------------- HELPERS: CACHE ---------------- */

function _isValidCached(fetched, ttl) {
  const ttl_ms = ttl ? ttl : CACHE_EXP_MS;
  if (fetched && parseFloat(fetched) + ttl_ms > new Date().getTime()) {
    return true;
  }
  return false;
}

function isValidCacheResp(response) {
  if (!response) {
    return false;
  }
  const fetchedDate = response.headers.get(CACHE_EXP_HEADER);
  return _isValidCached(fetchedDate);
}

function isValidCacheLinkStatus(linkStatus) {
  if (!linkStatus) {
    return false;
  }
  const fetchedDate = linkStatus[CACHE_EXP_HEADER];
  return _isValidCached(fetchedDate);
}

function isValidCacheDNS(dnsEntry) {
  if (!dnsEntry) {
    return false;
  }
  const fetchedDate = dnsEntry[CACHE_EXP_HEADER];
  return _isValidCached(fetchedDate);
}

async function addResourcesToCache(cacheName, resources) {
  const cache = await caches.open(cacheName);
  await cache.addAll(resources);
}

/* ---------------- HELPERS: LINKS ---------------- */

function getLinkStatusFromCache(link) {
  try {
    return CACHE_LINK_STATUS[link];
  } catch (err) {
    return null; // unknown
  }
}

async function resolveIP(domain) {
  const url = `https://dns.google/resolve?name=${domain}&type=a&do=1`;
  console.debug(`resolveIP ${domain} ${url}`);
  let ip = null;
  try {
    const resp = await fetchWithTimeout(url);
    const result = await resp.json();
    console.debug(`  ok ${domain}`, result);
  } catch (err) {
    console.warning(`  err ${domain}`, err);
  }
  return ip;
}

/* ---------------- HELPERS ---------------- */
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort(`Request timed out with ${timeout}`);
  }, timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

/* ---------------- WEBSOCKETS ---------------- */
// function sendSocketMessageWithRetry(socket, data) {
//     try {
//         socket.send(data);
//         console.debug(`[lms] websocket data sent `, jsonData);
//     } catch (err) {
//         const changeToNoopMode = connErrored();
//         if (!changeToNoopMode) {
//             setTimeout(() => {
//                 sendSocketMessageWithRetry(socket, data);
//             });
//         }
//     }
// }

function waitForSocketConnection(socket, callback) {
  setTimeout(() => {
    if ("readyState" in socket && socket.readyState === 1) {
      callback();
    } else {
      // try again
      connErrored();
      if (LMS_MODE == LMS_MODES.NORMAL) {
        waitForSocketConnection(socket, callback);
      }
    }
  }, 5); // wait 10 ms..
}

function sendMessageWS(route, data, onSuccess, onFail) {
  SOCKET_QUEUE_ID++;
  SOCKET_QUEUE[`i_${SOCKET_QUEUE_ID}`] = {
    onSuccess: onSuccess,
    onFail: onFail,
  };
  const jsonData = JSON.stringify({
    cmd_id: SOCKET_QUEUE_ID,
    route: route,
    data: data,
  });
  try {
    waitForSocketConnection(WEBSOCKET, function () {
      WEBSOCKET.send(jsonData);
      console.debug(`[lms] websocket data sent `, jsonData);
    });
  } catch (err) {
    console.debug(`[lms] websocket sending failed...`, err);
  }
}

function onMessageWS(event) {
  console.debug("[lms] websocket data received:", event.data);
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    console.log(`  err parsing data: `, err);
  }

  if (typeof data["cmd_id"] != "undefined") {
    const cmd_id = `i_${data["cmd_id"]}`;
    if (cmd_id in SOCKET_QUEUE) {
      const { onSuccess, onFail } = SOCKET_QUEUE[cmd_id];
      try {
        onSuccess(data["result"]);
        delete SOCKET_QUEUE[cmd_id];
        return;
      } catch (err) {
        console.log(` err processing msg w/ cmd_id=${cmd_id}`, err);
        onFail(cmd_id);
      }
    }
  }
}

function connectWS() {
  if (COMM_MODE == COMM_MODES.WS) {
    const ws = new WebSocket(`ws://${API_ADDRESS}`);
    ws.addEventListener("open", (event) => {
      console.log(`[lms] websocket connection opened...`);
      // refresh when socket connection is opened
      // so that we can query status of links
      forceRefresh(self.clients, false);
    });

    ws.addEventListener("close", (event) => {
      ws.close();
      console.log(
        `[lms] websocket closed, code: ${event.code} with reason: ${event.reason}`
      );
      setTimeout(() => connectWS(), 3000); // re-initialize connection
    });

    ws.addEventListener("message", onMessageWS);

    ws.addEventListener("error", (event) => {
      console.log(err);
      ws.close();
      connErrored();
    });

    WEBSOCKET = ws;
  }
}

/* ---------------- LOGIC ---------------- */

function connErrored(err) {
  NUM_CONN_ERRS++;
  if (err) {
    if (err.message.indexOf("aborted") > -1) {
      console.debug(`  err: request timed out...`);
    } else {
      console.debug(`  err: ${err}`);
    }
  }
  if (NUM_CONN_ERRS >= MAX_CONN_ERRS && LMS_MODE == LMS_MODES.NORMAL) {
    console.error(`reloading in NOOP mode`);
    CONFIG = {}; // signal error
    LMS_MODE = LMS_MODES.NOOP_SW;
    clearInterval(INTERVAL_CFG);
    INTERVAL_CFG = setInterval(fetchConfig, HEARTBEAT_INTERVALS.ERRORED);
    forceRefresh(self.clients, false);
  }
}

function refreshIfNewConfig(newConfig) {
  if (NUM_CONN_ERRS >= MAX_CONN_ERRS) {
    clearInterval(INTERVAL_CFG);
    INTERVAL_CFG = setInterval(fetchConfig, HEARTBEAT_INTERVALS.NORMAL);
  }
  NUM_CONN_ERRS = 0; // reset err count on successful config fetch
  const isNew = JSON.stringify(newConfig) !== JSON.stringify(CONFIG);
  console.debug(`  fetchConfig ok, isNew=${isNew}`, newConfig);
  if (isNew) {
    CONFIG = newConfig;
    if (CONFIG.mode) {
      LMS_MODE = CONFIG.mode;
    }
    // TODO: currently unnecessary to force a reload
    // because the config only changes the mode, which is OK dynamically
    // forceRefresh(self.clients, false);
  }
}

/**
 * Fetches the latest configuration.
 */
async function fetchConfig() {
  if (COMM_MODE != COMM_MODES.WS) {
    return fetchConfigHTTP();
  } else {
    return fetchConfigWS();
  }
}

async function fetchConfigHTTP() {
  const url = `${COMM_MODE}://${API_ADDRESS}/config`;
  console.debug(`fetchConfig...`);
  try {
    const resp = await fetchWithTimeout(url);
    const newConfig = await resp.json();
    refreshIfNewConfig(newConfig);
  } catch (err) {
    connErrored(err);
  }
}

async function fetchConfigWS() {
  console.debug(`fetchConfigWS...`);
  sendMessageWS("/config", {}, refreshIfNewConfig, (err) => connErrored(err));
}

// /**
//  * Fetches blocked or allowed URLs associated with a given
//  * website page and updates BLOCKED_URLS or ALLOWED_URLS accordingly.
//  * @param {string} page URL of the website page
//  * @param {Object} urls BLOCKED_URLS or ALLOWED_URLS
//  * @param {string} endpoint API endpoint
//  */
// async function _fetchLinks(page, urls, endpoint) {
//     if (!isSameOrigin(page)) {
//         return;
//     }
//     console.debug(`[lms]: _fetchLinks ${page} ${endpoint}`);
//     const timestamp = Date.now();
//     try {
//         const resp = await fetch(endpoint);
//         const result = await resp.json();
//         const links = new Set(result["links"]);
//         for (const link of links) {
//             urls[link] = { timestamp: timestamp };
//         }
//     } catch (err) {
//         console.error(`[lms]: err`, err);
//     }
// }

async function fetchLinkStatuses(page) {
  // TODO: do nothing for now
  // don't want to be overly eager and negatively impact performance
  // ...also some other reason i don't quite remember
  return;

  if (!isSameOrigin(page)) {
    return;
  }
  const cacheFetchStatuses = CACHE_FETCH_STATUSES[page];
  if (isValidCacheLinkStatus(cacheFetchStatuses)) {
    return;
  }

  const domain = self.location.host;
  const encodedPage = btoa(page);
  const endpoint = `${ENDPOINT_STATUSES}/?domain=${domain}&page=${encodedPage}`;
  console.debug(`[lms]: _fetchLinks ${endpoint}`);
  const timestamp = Date.now();

  // usage info
  ENDPOINT_USAGE[ENDPOINT_STATUSES] += 1;

  if (LMS_MODE > LMS_MODES.NOOP_LMS) {
    try {
      const resp = await fetch(endpoint);
      const result = await resp.json();
      for (const [link, status] of Object.entries(result.statuses)) {
        // update the status of the individual links
        // associated with the main page
        CACHE_LINK_STATUS[link] = {
          status: status,
          [CACHE_EXP_HEADER]: timestamp,
        };
      }

      // update the timestamp for when the main page was queried
      CACHE_FETCH_STATUSES[page] = {
        [CACHE_EXP_HEADER]: new Date().getTime(),
      };
    } catch (err) {
      console.error(`[lms]: err`, err);
    }
  }
}

/**
 * Sends the latest DNS resolution information to the API server.
 */
async function postCurrentDNSResolutions() {
  // TODO: do nothing for now...
  return;

  const oldKeys = [];
  for (const [domain, resInfo] of Object.keys(CACHE_DNS)) {
    if (!isValidCacheDNS(resInfo)) {
      oldKeys.push(domain);
      continue;
    }
  }
  for (const oldKey of oldKeys) {
    delete CACHE_DNS[oldKey];
  }
  const url = `${API_ADDRESS}/links/resolutions`;
  const subscription = await self.registration.pushManager.getSubscription();
  const resp = await fetch(url, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription: subscription,
      dns: CACHE_DNS,
      ttl: 10,
    }),
  });
  console.debug(`postCurrentDNSResolutions`, resp);
}

/**
 * Queries the API server for whether an external link is allowed or blocked.
 * @param {string} link external link
 * @returns boolean indicating whether the link is allowed or blocked
 */
async function queryLinkStatus(_page, link) {
  const cacheLinkStatus = CACHE_LINK_STATUS[link];
  if (isValidCacheLinkStatus(cacheLinkStatus)) {
    return cacheLinkStatus["status"];
  }
  ENDPOINT_USAGE[ENDPOINT_STATUS] += 1;

  const domain = self.location.host;
  const page = _page ? _page : self.location.host;
  const encodedPage = btoa(page);
  const encodedUrl = btoa(link);
  const path = `${ENDPOINT_STATUS}/?domain=${domain}&page=${encodedPage}&url=${encodedUrl}`;

  let status = null;
  if (LMS_MODE <= LMS_MODES.NOOP_LMS) {
    status = true;
  } else {
    try {
      if (COMM_MODE != COMM_MODES.WS) {
        status = await queryLinkStatusHTTP(path);
      } else {
        status = await queryLinkStatusWS(path);
      }
    } catch (err) {
      // do nothing, defaults to true (noop mode)
    }
  }
  CACHE_LINK_STATUS[link] = {
    status: status,
    [CACHE_EXP_HEADER]: new Date().getTime(),
  };
  console.debug(`[lms]: queryLinkStatus ${status} ${page} ${link}`);
  return status;
}

async function queryLinkStatusHTTP(path) {
  const url = `${COMM_MODE}://${API_ADDRESS}${path}`;
  const resp = await fetchWithTimeout(url);
  const result = await resp.json();
  return result["status"];
}

async function queryLinkStatusWS(path) {
  const split = path.split("?");
  const route = split[0];
  let data = {};
  if (split.length > 1) {
    for (const kv of split[1].split("&")) {
      const kvSplit = kv.split("=");
      const key = kvSplit[0];
      const val = kvSplit.length > 1 ? kvSplit[1] : "";
      data[key] = val;
    }
  }
  console.debug(`queryLinkStatusWS...`);
  let promiseResolve = null;
  let promiseReject = null;
  let promise = new Promise((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
  });
  sendMessageWS(route, data, promiseResolve, promiseReject);
  const result = await promise;
  return result["status"];
}

async function cacheRequestResponse(request, response) {
  const resp = response;

  // do not cache response if it was not successful
  if (!resp.ok) {
    return resp;
  }

  // we cannot perform all the ops below for a cross-origin response
  if (isSameOrigin(request.url)) {
    const copy = resp.clone();
    const headers = new Headers(copy.headers);
    headers.append(CACHE_EXP_HEADER, new Date().getTime());
    const copyBlob = isNullBodyStatus(resp.status) ? null : await copy.blob();
    const copyWithExpiration = new Response(copyBlob, {
      status: copy.status,
      statusText: copy.statusText,
      headers: headers,
    });
    const cache = await caches.open(CACHE_NAME);
    if (!isLocalExtensionLink(request.url)) {
      // cannot cache chrome-extension:// links
      await cache.put(request.url, copyWithExpiration);
    }

    // TODO: unsure of performance implications here
    // extract links if the response is HTML and prefetch their statuses
    const copyBlobText = copyBlob === null ? null : await copyBlob.text();
    if (
      resp.headers.get("Content-Type") &&
      resp.headers.get("Content-Type") === "string" &&
      resp.headers.get("Content-Type").includes("text/html")
    ) {
      const rawHTML = copyBlobText;
      const clients = await self.clients.matchAll();
      const client = clients[Math.floor(Math.random() * clients.length)];
      if (client) {
        client.postMessage({
          type: MESSAGE_TYPE.EXTRACT_LINKS,
          url: request.url,
          data: rawHTML,
        });
      }
    }
  }
}

/**
 * Sends a request and caches the response.
 * @param {HTTPRequest} request request object
 * @returns HTTP response to the request
 */
async function fetchAndCacheRequest(request) {
  const cacheResp = await caches.match(request);
  if (isValidCacheResp(cacheResp)) {
    return cacheResp;
  }
  const resp = await fetchWithTimeout(request);
  // do this async
  cacheRequestResponse(request, resp);
  return resp;
}

/* ---------------- HANDLERS ---------------- */

async function onInstallEvent(event) {
  // event.waitUntil(addResourcesToCache(CACHE_NAME, ["/"]));
  console.log(`[lms]: install event ${self.location.host}`);
  await caches.delete(CACHE_NAME);
}

async function onActivateEvent(event) {
  console.log(`[lms]: activate event ${self.location.host}`);
  connectWS();
  INTERVAL_CFG = setInterval(fetchConfig, HEARTBEAT_INTERVALS.NORMAL);
  self.clients.claim(); // takes over all applicable clients
  forceRefresh(self.clients, false);
}

async function onFetchEvent(event, page) {
  try {
    const link = event.request.url;
    console.debug(`onFetchEvent page=${page} link=${link}`);
    const sameOrigin = isSameOrigin(link);
    const apiOrigin = isSameOrigin(link, `https://${API_ADDRESS}`);
    if (sameOrigin) {
      fetchLinkStatuses(link);
    }
    const cachedLinkStatus = getLinkStatusFromCache(link);
    const matchesBlocked =
      !sameOrigin && !apiOrigin && cachedLinkStatus === false;
    const matchesAllowed =
      sameOrigin ||
      apiOrigin ||
      isLocalExtensionLink(link) ||
      cachedLinkStatus === true;

    console.debug(
      `[lms]: fetch event for ${event.request.url} blocked=${matchesBlocked} allowed=${matchesAllowed}`
    );
    if (matchesBlocked) {
      return generateBlockedRequest();
    }
    // only query for status if not explicitly blocked or allowed
    const passThrough =
      matchesAllowed || (await queryLinkStatus(page, link)) === true;
    if (passThrough) {
      return fetchAndCacheRequest(event.request);
    } else {
      return generateBlockedRequest();
    }
  } catch (err) {
    console.debug(`[lms]: onFetchEvent err for ${event.request.url}`, err);
    return fetchWithTimeout(event.request);
  }
}

async function onMessageEvent(event) {
  if (!event.data) {
    return;
  }
  const msgType = event.data.type;
  console.debug(`[lms]: message ${JSON.stringify(event.data)}`);
  switch (msgType) {
    case MESSAGE_TYPE.FORCE_ACTIVATE:
    case MESSAGE_TYPE.UPDATE_MODE:
      const ua = event.data.ua;
      if (
        (ua && ua.indexOf("lms-noop-sw") > -1) ||
        NUM_CONN_ERRS >= MAX_CONN_ERRS
      ) {
        LMS_MODE = LMS_MODES.NOOP_SW;
      } else if (ua && ua.indexOf("lms-noop-lms") > -1) {
        LMS_MODE = LMS_MODES.NOOP_LMS;
      } else {
        LMS_MODE = LMS_MODES.NORMAL;
      }
      if (msgType === MESSAGE_TYPE.FORCE_ACTIVATE) {
        // forces the service worker to become active
        // and fires the 'activate' event
        self.skipWaiting();
      }
      break;
    case MESSAGE_TYPE.EXTRACT_LINKS:
      const links = event.data.data;
      console.debug(
        `[lms]: ${MESSAGE_TYPE.EXTRACT_LINKS} ${event.data.url} ${links}`
      );
      for (const link of links) {
        if (isSameOrigin(link)) {
          fetchLinkStatuses(link);
        } else {
          queryLinkStatus(event.data.url, link);
        }
      }
      break;
    case MESSAGE_TYPE.ACTIVE_TAB:
      ACTIVE_PAGE = event.data.url;
      console.debug(`[lms]: ${MESSAGE_TYPE.ACTIVE_TAB} ${event.data.url}`);
      break;
    case MESSAGE_TYPE.ENDPOINT_USAGE:
      clients.matchAll().then((clients) => {
        // force a refresh on all pages to ensure consistency
        clients.forEach((client) =>
          client.postMessage({
            type: MESSAGE_TYPE.ENDPOINT_USAGE,
            data: ENDPOINT_USAGE,
          })
        );
      });
      break;
    default:
      break;
  }
}

async function onPushEvent(event) {
  data = event.data.json();
  console.debug(`onPushEvent ${data.msg}`);
  switch (data.msg) {
    case MESSAGE_TYPE.CONFIG_UPDATE:
      await fetchConfig();
    default:
      break;
  }
}

async function getClientTimeout(clientId, timeout) {
  const p1 = new Promise((resolve) => setTimeout(resolve, timeout, null));
  const p2 = self.clients.get(clientId);
  return await Promise.race([p1, p2]);
}

/* ---------------- MAIN ---------------- */

self.addEventListener("install", (event) => {
  event.waitUntil(onInstallEvent(event));
});

self.addEventListener("activate", (event) => {
  onActivateEvent(event);
});

self.addEventListener("fetch", (event) => {
  if (LMS_MODE == LMS_MODES.NOOP_SW) {
    return;
  }
  const clientId = event.clientId || event.resultingClientId;
  event.respondWith(
    (async () => {
      const client = await getClientTimeout(clientId, 100);
      const page = client ? client.url : event.request.url;
      console.debug(`page: ${page} for request`, event);
      return onFetchEvent(event, page);
    })()
  );
});

self.addEventListener("message", (event) => {
  onMessageEvent(event);
});

// TODO: don't register push for now
// self.addEventListener("push", (event) => {
//     event.waitUntil(onPushEvent(event));
// });

// TODO: add in DNS resolution info
// function setIntervalDNS() {
//     INTERVAL_DNS = setInterval(postCurrentDNSResolutions, 10000);
// }
// setIntervalDNS();
