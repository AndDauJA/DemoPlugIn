const FORM_IDENTIFIER_CHOICE = "choice-form";
const INPUT_FORM_IDENTIFIER = "input-form";

let temporaryData = {}; // Objektas laikiniams duomenims


function generateUsernameInputForm() {

    // Remove existing input form if it exists
    removeInputForm();
    // removeRegistrationForm();

    const inputFormTitle = {
        lt: "Susikurkite slapyvardį/El.paštą",
        en: "Enter your Username/Email",
    };
    const formchoicesone = {
        lt: "Įrašyti į duomenų bazę ",
        en: "Write to data base",
    };
    const formchoicestwo = {
        lt: "Atšaukti",
        en: "Cancel",
    };

    const inputFormTitleText = getTableName(inputFormTitle);
    const inputFormAddUsername = getTableName(formchoicesone);
    const inputFormCacelRecord = getTableName(formchoicestwo);

    const inputForm = document.createElement('form');

    inputForm.innerHTML = `
<div class="input-form-container">
        <div class="plugin-choice-table" >${inputFormTitleText}</div>
        <input type="text" id="new-username-input" placeholder="Enter USERNAME">
        <div>
            <button type="button" id="submit-input" class="a-btn">${inputFormAddUsername}</button>
            <button type="button" id="cancel-input" class="a-btn">${inputFormCacelRecord}</button>
         </div>
         </div>
    `;
    setTimeout(() => {

    insertChoiceFormAfterInput(inputForm);
    inputForm.classList.add(INPUT_FORM_IDENTIFIER);
    loadchoiceCSS();

    const newUsernameInput = document.getElementById('new-username-input');

    if (newUsernameInput) {
        newUsernameInput.focus();
    } else {
        console.error('Username input element not found');
        return;
    }
    newUsernameInput.addEventListener('keydown', handleUsernameInputKeydown);
    document.getElementById('submit-input').addEventListener('click', handleSubmitInputClick);
    document.getElementById('cancel-input').addEventListener('click', handleCancelInputClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('focusin', handleDocumentFocusIn);
    }, 100); // Laikas milisekundėmis
}


function handleUsernameInputKeydown(event) {
    const newUsernameInput = event.target;
    if (event.key === 'Enter') {
        event.preventDefault();
        validateUsername(newUsernameInput.value.trim(), function (error, isValid) {
            if (error) {
                // Klaidos atveju nieko nedarome, pranešimas jau parodytas validateUsername funkcijoje
                const userInput = document.getElementById('new-username-input');
                if (userInput) {
                    userInput.value = '';
                    setTimeout(() => {
                        userInput.focus();
                    }, 10);
                }
                return;
            }
            if (isValid) {
                activeInputField.value = newUsernameInput.value.trim();
                removeInputForm();
                removeAllChanges();
            }
        });
    } else if (event.key === 'Escape') {
        removeInputForm();
        removeAllChanges();
        removeUserNameChanges();
    }
}

function handleSubmitInputClick(event) {
    event.preventDefault();
    const newUsernameInput = document.getElementById('new-username-input');

    if (newUsernameInput && activeInputField) {
        validateUsername(newUsernameInput.value.trim(), function (error, isValid) {
            if (error) {
                // Klaidos atveju nieko nedarome, pranešimas jau parodytas validateUsername funkcijoje
                const userInput = document.getElementById('new-username-input');
                if (userInput) {
                    userInput.value = '';
                    setTimeout(() => {
                        userInput.focus();
                    }, 10);
                }
                return;
            }
            if (isValid) {
                activeInputField.value = newUsernameInput.value.trim();

                removeInputForm();
                removeAllChanges();
            }
        });
    }
}


function handleCancelInputClick(event) {
    event.preventDefault();
    removeInputForm();
    removeAllChanges();
    removeUserNameChanges();
}

function handleDocumentClick(event) {
    const newUsernameInput = document.querySelector('.input-form');
    // const newUsernameInput = document.getElementById('new-username-input');
    if (!newUsernameInput.contains(event.target) && event.target !== newUsernameInput) {
        removeInputForm();
        removeAllChanges();
        removeUserNameChanges();
    }
}

function handleDocumentFocusIn(event) {
    const newUsernameInput = document.querySelector('.input-form');
    // const newUsernameInput = document.getElementById('new-username-input');
    if (event.target !== newUsernameInput && !newUsernameInput.contains(event.target)) {
        removeInputForm();
        removeAllChanges();

    }
}

function removeInputForm() {
    // const inputForm = document.getElementById('user-form');
    const inputForm = document.querySelector('.input-form');
    if (inputForm) {
        inputForm.remove();
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('focusin', handleDocumentFocusIn);
    }
}

// Funkcija, kuri įrašo vartotojo vardą į txt failą


function validateUsername(username, callback) {
    chrome.runtime.sendMessage({
        action: 'validateUsername',
        data: {username}
    }, function (response) {
        if (response.status === 'success' && response.isValid) {
            console.log("Username validation successful.");
            // Patvirtintas vartotojo vardas, galite tęsti su duomenų išsaugojimu
            if (typeof callback === 'function') {
                callback(null, true);
            }
        } else {
            // Klaida arba vartotojo vardas jau egzistuoja
            // console.error('Validation error:', response.error);
            alert('Username already exists. Please enter a different username.');

            setTimeout(() => {
                // const userInput = document.querySelector('input[data-my-username-attr="USER_NAME"]');
                const userInput = document.getElementById('new-username-input');
                if (userInput) {
                    userInput.value = '';
                }
                callback(response.error || 'Username already exists', null);
            }, 0);
        }
    });

}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'showSuccessMessage') {
        const message = request.message;
        alert(message); // Parodyti sėkmingo pranešimo alert
    } else if (request.action === 'showErrorMessage') {
        const message = request.message;
        alert(message); // Parodyti klaidos pranešimo alert
    }
});


