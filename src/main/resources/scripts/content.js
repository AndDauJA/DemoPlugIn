// // // //naudojant content.js  varianta

function redirectToLoginPage() {
    chrome.tabs.create({url: 'https://www.brigama.lt/login'});
}

// // ===============================================================================================================//
const TABLE_IDENTIFIER = "plugin-table";
const PROCESSED_INPUT_CLASS = "processed-input";
let lastFocusedInputField = null;

function isPasswordField(target) {
    return target.id === 'password' || target.type === 'password' || target.name === 'password' || target.type === "pass";
}


document.addEventListener('click', function (event) {
    const target = event.target;

    if (target.id === 'new-record') {

        removeChoiceTable();

        if (lastFocusedInputField && isPasswordField(lastFocusedInputField)) {
            generatePasswordInputForm();
        } else {
            generateUsernameInputForm();
        }
        // 100 milisekundžių vėlavimas (pavyzdys)
    }
});

document.addEventListener('click', function (event) {
    const target = event.target;

// // Patikrinkite, ar plėtinys aktyvuotas
//     chrome.storage.local.get('isActive', function (data) {
//         const isActive = data.isActive || false;
//
//         if (!isActive) {
//             // Jei plėtinys neaktyvus, nedarykite nieko
//             return;
//         }

    if ((target.id === 'existing-record') && !target.classList.contains(PROCESSED_INPUT_CLASS)) {
        removeChoiceTable();
        showLoadingSpinner(); // Rodyti indikatorių
        chrome.runtime.sendMessage({action: 'checkSession'}, function (response) {
            // Handle the response from the background script
            console.log(response);
        });

    }


    existingTable = document.querySelector(`.${TABLE_IDENTIFIER}`);

    if (target.tagName === 'A' && (target.parentElement.classList.contains('username-cell') || target.parentElement.classList.contains('key-cell'))) {
        const row = target.parentElement.parentElement; // Row containing the clicked link
        const form = target.closest('form');
        // const form = document.querySelector('.js-auth-dialog-form');
        if (!form) {
            console.log('Form not found');
            return;
        }
        let inputField;
        let copyText = target.textContent;

        if (target.parentElement.classList.contains('username-cell')) {
            inputField = form.querySelector('input[data-my-custom-attr="USER_NAME_PASSWORD"], input[type="email"]');
        } else if (target.parentElement.classList.contains('key-cell')) {
            copyText = target.dataset.realKey; // Use the real key instead of masked text
            inputField = form.querySelector('input[data-my-custom-attr="PASSWORD_NAME"], input[type="password"]');
        }
        // console.error('Input Field rasta:', inputField);

        if (inputField) {
            // Copy the text to clipboard
            navigator.clipboard.writeText(copyText).then(() => {
                // Temporarily disable events
                temporarilyDisableEvents(inputField);

                // Paste the text into the input field
                inputField.focus();
                inputField.value = copyText;

                // Restore events
                restoreEvents(inputField);

                // Dispatch an input event to trigger any event listeners
                const inputEvent = new Event('input', {bubbles: true});
                inputField.dispatchEvent(inputEvent);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            console.error('Input field not found.');
            return;
        }
        removeTable();
    }

    function temporarilyDisableEvents(element) {
        element.addEventListener('input', preventEvent, true);
        element.addEventListener('change', preventEvent, true);
    }

    function restoreEvents(element) {
        element.removeEventListener('input', preventEvent, true);
        element.removeEventListener('change', preventEvent, true);
    }

    function preventEvent(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
    }

// Close table if clicking outside of it
    if (existingTable && !existingTable.contains(target) && (target.tagName !== 'INPUT' || target.name !== 'USER_NAME_PASSWORD' || target.name !== 'PASSWORD_NAME')) {
        removeTable();
        removeAllChanges();
    }


});
// });

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'generateTable') {
        const userDataList = message.userDataList;
        // hideLoadingSpinner();
        generateTable(userDataList);


    }
});


function getTableName(tableNames) {
    const lang = document.documentElement.lang;
    return tableNames[lang] || tableNames['en'];
}

// ============================Table==========================================//
// Objektas, kuriame bus saugomi seni laukelių pavadinimai
function generateTable(userDataList) {

    const tableNames = {
        lt: "UAB Brigama Slaptažodžių valdytojas",
        en: "UAB Brigama Password Manager EN",
    };

    const tableName = getTableName(tableNames);

    const existingTable = document.querySelector(`.${TABLE_IDENTIFIER}-container`);
    if (existingTable) {
        existingTable.remove();
        restoreFieldNames(); // Atkurti laukelių pavadinimus
    }
    const tableContainer = document.createElement('div');
    tableContainer.className = `${TABLE_IDENTIFIER}`;
    const table = document.createElement('table');
    table.className = `${TABLE_IDENTIFIER}-container`;
    table.innerHTML = `
<tr>
 <th class="plugin-table-name" colspan="3">${tableName}</th>
</tr>
    <tr>
        <th class="plugin-table-th">Adresas</th>
        <th class="plugin-table-th">Vartotojo vardas</th>
        <th class="plugin-table-th">Generated Key</th>
        <th class="plugin-table-th">Pastabos</th>
    </tr>
    `;
    userDataList.forEach(userData => {
        const row = document.createElement('tr');

        // Web Address Cell
        const webAddressCell = document.createElement('td');
        webAddressCell.className = 'webaddress-cell';
        const webAddressLink = document.createElement('a');
        webAddressLink.href = userData.webmetadata; // Panaudoti URLmeta kaip nuorodą
        webAddressLink.textContent = userData.webmetadata; // Rodyti URL kaip tekstą
        webAddressLink.target = '_blank'; // Atidaryti nuorodą naujame skirtuke
        webAddressCell.appendChild(webAddressLink);

        // Username Cell
        const usernameCell = document.createElement('td');
        usernameCell.className = 'username-cell';
        const usernameLink = document.createElement('a');
        usernameLink.href = "#";
        usernameLink.textContent = userData.userNameEmail;
        usernameCell.appendChild(usernameLink);

        // Key Cell
        const keyCell = document.createElement('td');
        keyCell.className = 'key-cell';
        const keyLink = document.createElement('a');
        keyLink.href = "#";
        keyLink.textContent = "*****"; // Rodyti slaptažodį kaip zvaigždutes
        keyLink.dataset.realKey = userData.decryptedKey; // Saugo tikrąjį raktą data atributu
        keyCell.appendChild(keyLink);
        // Notes Cell
        const notesCell = document.createElement('td');
        notesCell.className = 'notes-cell';
        notesCell.textContent = userData.notes;

        // Append cells to row
        row.appendChild(webAddressCell);
        row.appendChild(usernameCell);
        row.appendChild(keyCell);
        row.appendChild(notesCell);

        table.appendChild(row);
    });
    tableContainer.appendChild(table);
    insertTableAfterInput(tableContainer);
    // table.classList.add(TABLE_IDENTIFIER);
    loadCSS();
    hideLoadingSpinner();
}

function loadCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('/static/css/pluginform.css');
    document.head.appendChild(link);
}

//
function removeTable() {
    const existingTable = document.querySelector(`.${TABLE_IDENTIFIER}`);
    if (existingTable) {
        existingTable.remove();
        removeAllChanges();
    }
}

function removeAllChanges() {

    const inputFields = document.querySelectorAll('input[data-my-custom-attr]');
    inputFields.forEach(field => {
        // field.name = field.dataset.originalName; // Atstatyti senąjį pavadinimą

        field.removeAttribute('data-my-custom-attr'); // Pašalinti 'choice-original-name' atributą
    });
}

let activeTable = null;
let activeChoiceTable = null;
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        if (activeTable) {
            removeTable(); // Jei aktyvi lentelė, pašaliname tik lentelę
            activeTable = null; // Išvalome aktyvios lentelės kintamąjį
        } else if (activeChoiceTable) {
            removeChoiceTable(); // Jei aktyvus pasirinkimo langas, pašaliname tik pasirinkimo langą
            activeChoiceTable = null; // Išvalome aktyvaus pasirinkimo lango kintamąjį
        }
    }
});


function insertTableAfterInput(table) {

    const inputField = document.querySelector('input[data-my-custom-attr="USER_NAME_PASSWORD"],input[name="PASSWORD_NAME"]');
    if (inputField) {
        const container = inputField.parentElement;
        inputField.insertAdjacentElement('afterend', table);

    }
}

//
function restoreFieldNames() {
    const inputFields = document.querySelectorAll('input[data-original-name]');
    if (inputFields)
        inputFields.forEach(field => {
            field.name = field.dataset.originalName; // Atstatyti senąjį pavadinimą
            field.removeAttribute('data-original-name'); // Pašalinti 'data-original-name' atributą

        });
}

// function restoreChoiceFieldNames() {
//     const inputFields = document.querySelectorAll('input[choice-original-name]');
//     inputFields.forEach(field => {
//         field.name = field.dataset.originalName; // Atstatyti senąjį pavadinimą
//
//         field.removeAttribute('choice-original-name'); // Pašalinti 'choice-original-name' atributą
//     });
//
// }










