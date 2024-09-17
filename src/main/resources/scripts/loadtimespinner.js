function showLoadingSpinner() {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.style.position = 'absolute';
        spinner.style.top = '50%';
        spinner.style.left = '50%';
        spinner.style.transform = 'translate(-50%, -50%)';
        spinner.style.border = '16px solid #f3f3f3';
        spinner.style.borderRadius = '50%';
        spinner.style.borderTop = '16px solid #3498db';
        spinner.style.width = '120px';
        spinner.style.height = '120px';
        spinner.style.animation = 'spin 2s linear infinite';
        document.body.appendChild(spinner);
    }
}


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'hideTheLoadingSpinner') {
        hideLoadingSpinner();
        sendResponse({ status: 'spinner hidden' }); // Pridėti atsakymą
    }
});

function hideLoadingSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}