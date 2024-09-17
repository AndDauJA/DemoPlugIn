
document.addEventListener('DOMContentLoaded', function() {
    // Check session status when the DOM is fully loaded
    chrome.runtime.sendMessage({ action: 'checkSessionatStart' }, function(response) {
        if (response.status === 'loggedIn') {
            chrome.runtime.sendMessage({ action: 'setLoggedIn' });
            window.location.href = 'form.html';
        } else {
            redirectToLoginPage();
        }
    });

    document.getElementById('login-btn').addEventListener('click', function() {
        redirectToLoginPage();
    });

    document.getElementById('cancel-btn').addEventListener('click', function() {
        window.close();
    });
});
