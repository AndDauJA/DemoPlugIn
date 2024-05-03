// background.js

// Add a listener for the browser action
chrome.browserAction.onClicked.addListener(function(tab) {
    // Execute a content script on the active tab
    chrome.tabs.executeScript({
        file: 'content.js'
    });
});
