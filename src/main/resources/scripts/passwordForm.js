const PASSWORD_INPUT_FORM_IDENTIFIER = "password-input-form"


function generatePasswordInputForm(event) {
    activeInputField = document.activeElement;
    removeUserNameChangesForPassword();
    removeReadOnlyFromPasswordInput();
    removePasswordInputForm();
    // removeRegistrationForm();


    const inputPasswordFormTitle = {
        lt: "Susikurkite slaptažodį",
        en: "Enter your password",
    };
    const passwordFormchoicesone = {
        lt: "Įrašyti į duomenų bazę ",
        en: "Write to data base",
    };
    const passwordFormchoicestwo = {
        lt: "Atšaukti",
        en: "Cancel",
    };
    const checkboxLabels = {
        lt: ["Tekstas (xxxx-xxxx-...)", "Kombinuotas kodas"],
        en: ["Text (xxxx-xxxx-...)", "Combined code"],
    };
    const passwordStrengthTitle = {
        lt: "Slaptažodžio stiprumas (min 16 simboliai)",
        en: "Password strength (min 16 simbols)",
    };
    const passwordGenerateBtn = {
        lt: "Generuoti",
        en: "Generate",
    };

    const inputFormTitleText = getTableName(inputPasswordFormTitle);
    const passwStrTitleText = getTableName(passwordStrengthTitle);
    const passwGenTitleBtn = getTableName(passwordGenerateBtn);
    const inputFormAddPassword = getTableName(passwordFormchoicesone);
    const inputFormCancelRecord = getTableName(passwordFormchoicestwo);
    const checkboxLabelTexts = getTableName(checkboxLabels);

    const inputPasswordForm = document.createElement('form');
    inputPasswordForm.innerHTML = `
<div class="password-container">
        <div class="plugin-choice-table padding" >${inputFormTitleText}</div>
        <input type="text" class="padding" id="new-password-input" placeholder="Enter PASSWORD">
         <div class="plugin-choice-table padding" >${passwStrTitleText}</div>
       <div class="password-strength-container padding">
            <input type="text" class="padding" id="password-str-input" placeholder="Enter min 16 simbl.">
            <button type="button" id="generate-password" class="a-btn padding">${passwGenTitleBtn}</button>
        </div>
        <div id="messageContainer" class="padding"></div>
        <div class="padding">
            <input class="padding" type="radio" id="radio1" name="radio-password-type" value="text">
            <label class="padding" for="radio1">${checkboxLabelTexts[0]}</label>
        </div>
        <div class="padding">
            <input class="padding" type="radio" id="radio2" name="radio-password-type" value="combined">
            <label class="padding" for="radio2">${checkboxLabelTexts[1]}</label>
        </div>
        <div class="padding">
            <button type="button" id="submit-password" class="a-btn">${inputFormAddPassword}</button>
            <button type="button" id="cancel-password" class="a-btn">${inputFormCancelRecord}</button>
         </div>
</div>
    `;

    insertChoiceFormAfterInput(inputPasswordForm);
    inputPasswordForm.classList.add(PASSWORD_INPUT_FORM_IDENTIFIER);
    loadchoiceCSS();

    const newPassword = generatePassword(16, true);
    const newPasswordInput = document.getElementById('new-password-input');
    if (newPasswordInput) {
        newPasswordInput.value = newPassword;
    }


    newPasswordInput.focus();

    const handlePasswordInputKeydown = function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (activeInputField) {
                activeInputField.value = event.target.value;
            }
            removePasswordInputForm();
            removeAllChanges();
        } else if (event.key === 'Escape') {
            removePasswordInputForm();
            removeAllChanges();
        }
    };

    // const handleSubmitPasswordClick = function (event) {
    //     event.preventDefault();
    //     const newPasswordInput = document.getElementById('new-password-input');
    //     if (newPasswordInput && activeInputField) {
    //         activeInputField.value = newPasswordInput.value;
    //         removePasswordInputForm();
    //         removeAllChanges();
    //     } else {
    //         alert('Password length must be at least 16haracters.');
    //     }
    // };
    const handleSubmitPasswordClick = async function (event) {
        event.preventDefault();
        const newPasswordInput = document.getElementById('new-password-input');
        if (newPasswordInput && newPasswordInput.value.length >= 16 && activeInputField) {
            activeInputField.value = newPasswordInput.value;
            // const usernameInput = document.querySelector('input[data-my-username-attr="USER_NAME"]');
            // const usernameInput = await getUsername();
            // if (!usernameInput) {
            //     alert('Please enter a username before saving to the database.');
            //     return; // Nutraukti funkcijos vykdymą, jei nėra įvesto username
            // }
            // Ideti siuntima i DB
            await sendUsernameAndPasswordToServer();
            removeUserNameChanges();
            removePasswordInputForm();
            removeAllChanges();
        } else {
            alert('Password length must be at least 16 characters.');
        }
    };


    const handleCancelPasswordClick = function (event) {
        event.preventDefault();
        removePasswordInputForm();
        removeAllChanges();
    };
    const handleDocumentClick = function (event) {
        if (!inputPasswordForm.contains(event.target) && event.target !== newPasswordInput) {
            removePasswordInputForm();
            removeAllChanges();
        }
    };

    const handleDocumentFocusIn = function (event) {
        if (event.target !== newPasswordInput && !inputPasswordForm.contains(event.target)) {
            removePasswordInputForm();
            removeAllChanges();
        }
    };

    const handleGeneratePasswordClick = function (event) {

        event.preventDefault();
        const radio1 = document.getElementById('radio1');
        const radio2 = document.getElementById('radio2');
        const length = parseInt(document.getElementById('password-str-input').value);

        if (length >= 16) {
            let generatedPassword;
            if (radio1.checked) {
                generatedPassword = generatePassword(length, false);
            } else if (radio2.checked) {
                generatedPassword = generatePassword(length, true);
            } else {
                alert('Please select a checkbox to generate password.');
                return;
            }

            newPasswordInput.value = generatedPassword;
            newPasswordInput.focus();
            newPasswordInput.setSelectionRange(newPasswordInput.value.length, newPasswordInput.value.length);

            if (activeInputField) {
                activeInputField.value = generatedPassword;
            }
        } else {
            alert('Password length must be at least 16 characters.');
        }
    };

    function generatePassword(length, includeSpecialChars) {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const specialCharset = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/";
        const combinedCharset = includeSpecialChars ? charset + specialCharset : charset;
        let password = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * combinedCharset.length);
            password += combinedCharset[randomIndex];
        }

        return password.match(/.{1,5}/g).join('-');
    }


    newPasswordInput.addEventListener('keydown', handlePasswordInputKeydown);
    document.getElementById('submit-password').addEventListener('click', handleSubmitPasswordClick);
    document.getElementById('cancel-password').addEventListener('click', handleCancelPasswordClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('focusin', handleDocumentFocusIn);
    // newPasswordInput.addEventListener('focus', handlePasswordInputFocus);
    document.getElementById('generate-password').addEventListener('click', handleGeneratePasswordClick);

    // Remove event listeners when the form is removed


    function removePasswordInputForm() {
        const existingInputForm = document.querySelector(`.${PASSWORD_INPUT_FORM_IDENTIFIER}`);
        if (existingInputForm) {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('focusin', handleDocumentFocusIn);

            if (newPasswordInput) {
                newPasswordInput.removeEventListener('keydown', handlePasswordInputKeydown);
            }

            const submitPasswordBtn = document.getElementById('submit-password');
            if (submitPasswordBtn) {
                submitPasswordBtn.removeEventListener('click', handleSubmitPasswordClick);
            }

            const cancelPasswordBtn = document.getElementById('cancel-password');
            if (cancelPasswordBtn) {
                cancelPasswordBtn.removeEventListener('click', handleCancelPasswordClick);
            }

            const generatePasswordBtn = document.getElementById('generate-password');
            if (generatePasswordBtn) {
                generatePasswordBtn.removeEventListener('click', handleGeneratePasswordClick);
            }

            existingInputForm.remove();
        }
    }

}

function removeReadOnlyFromPasswordInput() {
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
        passwordInput.removeAttribute('readonly');
    }
}


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('generate-password').addEventListener('click', displayGeneratedPassword);
});

function displayGeneratedPassword() {
    const length = parseInt(document.getElementById('password-str-input').value);
    const password = generatePassword(length);
    document.getElementById('new-password-input').value = password;
    document.getElementById('new-password-input').focus();
    document.getElementById('new-password-input').setSelectionRange(password.length, password.length);

}

//====================== Siuncia UserName i DB ===============================================================
// function getUsername() {
//     const usernameInput = document.querySelector('input[data-my-username-attr="USER_NAME"]');
//     // if (!usernameInput || !usernameInput.value.trim()) {
//     //     return null; // Grąžinti null, jei nėra įvesto username arba laukelis neegzistuoja
//     // }
//     // return usernameInput.value.trim();
//     return usernameInput ? usernameInput.value.trim() : null;
// }
function getUsername() {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getUsername' }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message);
                reject(chrome.runtime.lastError);
            } else {
                resolve(response.username);
            }
        });
    });
}



function getPassword() {

    return document.getElementById('new-password-input').value;
}

function getWebAddress() {
    return window.location.href;
}

function getWebAddressData() {
    const webAddress = getWebAddress();
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)/i;
    const matches = webAddress.match(domainRegex);
    if (matches) {
        let webaddress = matches[1];
        // Patikrinti, ar adresas jau turi https:// prefiksą
        if (!webaddress.startsWith('https://')) {
            webaddress = 'https://' + webaddress;
        }
        return webaddress;
    }

    return null;
}

function getWebMetadata() {
    const webAddress = getWebAddress();
    const domainRegex = /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)/i;
    const matches = webAddress.match(domainRegex);
    return matches ? matches[1] : null;
}

async function sendUsernameAndPasswordToServer() {

    const username = await getUsername();
    const password = getPassword();
    const webAddress = getWebAddressData();
    const webmetadata = getWebMetadata();

    const userInput = document.querySelector('input[data-my-username-attr="USER_NAME"]');
    if (!username || !password) {
        if (!username) {
            alert('Please enter a username.');
            if (userInput) {
                userInput.value = '';
                userInput.focus();
            }
        } else {
            alert('Please enter a password of at least 16 characters.');
        }
        return; // Nutraukti funkcijos vykdymą, jei trūksta username arba password
    }

    const confirmation = confirm('Are you sure you want to save data to the database?');
    if (!confirmation) {
        if (userInput) {
            userInput.value = '';
            userInput.focus();
        }

        return; // Jei vartotojas paspaudė "Cancel", nutraukiame funkcijos vykdymą
    }

    chrome.runtime.sendMessage({
        action: 'sendUsernameAndPassword',
        data: {username, password, webAddress, webmetadata}
    }, function (response) {
        console.log('Response from background:', response);
    });
}

function removeUserNameChanges() {

    const inputFields = document.querySelectorAll('input[data-my-username-attr]');
    inputFields.forEach(field => {
        // field.name = field.dataset.originalName; // Atstatyti senąjį pavadinimą

        field.removeAttribute('data-my-username-attr'); // Pašalinti 'choice-original-name' atributą
    });
}


function removeUserNameChangesForPassword() {
    if (activeInputField && activeInputField.hasAttribute('data-my-username-attr')) {
        activeInputField.removeAttribute('data-my-username-attr');
    }
}


//===========================================================================================================



