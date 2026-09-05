"use strict";

const ROUTE_POINTS_PREFIX = "routePoints:";

function routePointsKey(tabId) {
    return ROUTE_POINTS_PREFIX + tabId;
}

function isZezoRouteUrl(url) {
    if (!url) {
        return false;
    }

    try {
        const parsedUrl = new URL(url);
        const isHttp = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
        const isZezo = parsedUrl.hostname === "zezo.org" || parsedUrl.hostname.endsWith(".zezo.org");
        return isHttp && isZezo && /\/chart\.pl$/.test(parsedUrl.pathname);
    } catch (error) {
        return false;
    }
}

function updateAction(tabId, url) {
    if (isZezoRouteUrl(url)) {
        chrome.action.enable(tabId);
    } else {
        chrome.action.disable(tabId);
    }
}

function updateAllActions() {
    chrome.action.disable();
    chrome.tabs.query({}, function (tabs) {
        tabs.forEach(function (tab) {
            if (tab.id !== undefined) {
                updateAction(tab.id, tab.url);
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request?.type !== "routeMarinsPoints" || sender.tab?.id === undefined) {
        return;
    }

    const tabId = sender.tab.id;
    const points = Array.isArray(request.points) ? request.points : [];
    chrome.storage.session.set({ [routePointsKey(tabId)]: points });
    chrome.action.enable(tabId);
});

chrome.runtime.onInstalled.addListener(updateAllActions);
chrome.runtime.onStartup.addListener(updateAllActions);

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if (!chrome.runtime.lastError) {
            updateAction(activeInfo.tabId, tab.url);
        }
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.url !== undefined || changeInfo.status === "complete") {
        updateAction(tabId, changeInfo.url || tab.url);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
    chrome.storage.session.remove(routePointsKey(tabId));
});
