

document.addEventListener('DOMContentLoaded', function () {
    const activateButton = document.getElementById('activate-plugin');
    const deactivateButton = document.getElementById('deactivate-plugin');
    const pluginStatus = document.getElementById('plugin-status');

    if (!pluginStatus) {
        console.error("Element with ID 'plugin-status' not found.");
        return;
    }

    function updateFormStatus(isActive) {
        if (isActive) {
            pluginStatus.classList.remove('inactive');
            pluginStatus.classList.add('active');
            pluginStatus.textContent = 'Plugin Activated';
            activateButton.classList.add('active');
            deactivateButton.classList.remove('deactivate');
        } else {
            pluginStatus.classList.remove('active');
            pluginStatus.classList.add('inactive');
            pluginStatus.textContent = 'Plugin Not Active';
            activateButton.classList.remove('active');
            deactivateButton.classList.add('deactivate');
        }
    }

    chrome.storage.local.get(['isActive', 'buttonColor'], function (data) {
        const isActive = data.isActive || false;
        updateFormStatus(isActive);

        activateButton.addEventListener('click', function () {
            chrome.storage.local.set({ isActive: true, buttonColor: 'green' });
            chrome.runtime.sendMessage({ action: "change_extension_status", isActive: true });
            chrome.runtime.sendMessage({ action: "change_button_color", color: 'green' });
            updateFormStatus(true);
        });

        deactivateButton.addEventListener('click', function () {
            chrome.storage.local.set({ isActive: false, buttonColor: 'red' });
            chrome.runtime.sendMessage({ action: "change_extension_status", isActive: false });
            chrome.runtime.sendMessage({ action: "change_button_color", color: 'red' });
            updateFormStatus(false);
        });
    });


    chrome.storage.local.set({ isActive: false, buttonColor: 'red' });
});



