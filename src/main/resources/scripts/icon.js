// Suraskite visus username ir password laukelius
const usernameFields = document.querySelectorAll('input[name="username"], input[name="email"],input[name="identifier"],input[type="email"], input[type="username"]');
const passwordFields = document.querySelectorAll('input[name="password"], input[name="pass"],input[name="identifier"], input[type="password"]');
// const ipnputIdFields = document.querySelectorAll('input[id="username"], input[id="pass"],input[id="identifier"], input[type="email"]');

// Pridėkite savo ikoną į kiekvieną rastą username laukelį

usernameFields.forEach((field, index) => {
    // field.classList.add('fusername');
    field.setAttribute('data-my-custom-color-attr', 'USER_NAME_COLOR');
    field.style.backgroundColor = 'lightblue';
    // field.name = "USER_NAME"
});

passwordFields.forEach(field => {
    // field.setAttribute('autocomplete', 'new-password'); // Įrašykite 'new-password' į autocomplete atributą
    field.setAttribute('data-my-custom-color-attr', 'PASSWORD_NAME_COLOR');
    field.style.backgroundColor = 'pink';
});

loadinputIconCSS();

function loadinputIconCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('/static/css/inputIcon.css');
    document.head.appendChild(link);
}

window.addEventListener('load', function () {
    window.scrollTo(0, 0);
    removeAutofocus();
});

function removeAutofocus() {
    const autofocusFields = document.querySelectorAll('[autofocus]');
    autofocusFields.forEach(field => {
        field.removeAttribute('autofocus');
    });
}


let usernameInput = document.getElementById('username');
if (usernameInput) {
    usernameInput.setAttribute('autocomplete', 'off');
}
const passwordInput = document.querySelector('input[type="password"]');
if (passwordInput) {
    passwordInput.addEventListener('focus', function() {
        // Atšaukti slaptažodžių pasiūlymą
        passwordInput.setAttribute('readonly', 'readonly');
        // passwordInput.removeAttribute('readonly');
    });
}



