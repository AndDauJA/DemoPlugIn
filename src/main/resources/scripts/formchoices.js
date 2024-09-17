const TABLE_IDENTIFIER_CHOICE = "choice-table";
const originaChoiceFieldNames = {};
let activeInputField = null;

//TODO paziureti kad i kitus input laukelius nereagutu ir nesiulytu pasirinkimo
function isHomePage(url) {
    return url.includes('https://www.brigama.lt/login');
}
document.addEventListener('focusin', function (event) {
    if (event.target.tagName === 'INPUT') {
        lastFocusedInputField = event.target;
    }
});


function addInputListeners() {
    document.querySelectorAll('input').forEach(input => {

        input.removeEventListener('click', handleInputClick); // Pašaliname senus event listener
        input.addEventListener('click', handleInputClick); // Pridedame naują event listener
    });
}

function handleInputClick(event) {

    const target = event.target;
    if (target.id === 'new-username-input' || target.id === 'new-password-input' || target.id === 'password-str-input' ||
        target.name === 'passwordType'||target.name=== 'radio-password-type') {

        return;
    }

    removeChoiceTable();
    if (document.querySelector(`.${FORM_IDENTIFIER_CHOICE}`) && activeInputField === target) {
        return;
    }
    if (target.tagName.toLowerCase() === 'input' && target.type === 'image') {
        return; // Do nothing if it's an image input
    }

// KAI NORIU PASPAUDES INPUT LEUKELYJE KAD PAKEISTU ATRIBUTA AUTOCOMPLETE=OFF
    if (event.target.matches('input') && !isHomePage(window.location.href)) {
        event.target.setAttribute('autocomplete', 'off');
    }
    if (document.querySelector(`.${FORM_IDENTIFIER_CHOICE}`) && activeInputField === target) {
        return; // Do nothing if the registration form is already open and the same input field is clicked
    }

    // Set up the active input field with Username and password credentials
    activeInputField = target;
    target.setAttribute('data-my-custom-attr', 'USER_NAME_PASSWORD');
    target.setAttribute('data-my-username-attr', 'USER_NAME');

    generateChoiceTable();

    const existingTableChoice = document.querySelector(`.${TABLE_IDENTIFIER_CHOICE}`);

    if (existingTableChoice && !existingTableChoice.contains(target) && !(target.matches('input[data-my-custom-attr="USER_NAME_PASSWORD"]'))) {
        removeChoiceTable();
        activeInputField = null;

    }

}

function getTableName(tableNames) {
    const lang = document.documentElement.lang;
    return tableNames[lang] || tableNames['en'];
}

function generateChoiceTable() {
    const choiceTableNames = {
        lt: "Pasirinkite veiksmą",
        en: "Choose your action",
    };
    const choicesone = {
        lt: "Primą kąrtą jungiantis",
        en: "First time logingIn",
    };
    const choicestwo = {
        lt: "Esamas įrašas",
        en: "An existing record",
    };
    const choicetableName = getTableName(choiceTableNames);
    const choiceone = getTableName(choicesone);
    const choicetwo = getTableName(choicestwo);

    const table = document.createElement('table');
    table.innerHTML = `
<tr>
 <th class="plugin-choice-table" colspan="2">${choicetableName}</th>
</tr>
<tr>
 <td class="choice-table-td"><button id="new-record" class="a-btn">${choiceone}</button></td>
 <td class="choice-table-td"><button id="existing-record" class="a-btn">${choicetwo}</button></td>
</tr>
    `;
    activeInputField = document.querySelector('input[data-my-custom-attr="USER_NAME_PASSWORD"]');
    if (activeInputField) {
        activeInputField.value = '';
    }
    insertChoiceTableAfterInput(table);
    table.classList.add(TABLE_IDENTIFIER_CHOICE);
    loadchoiceCSS();

}
function loadchoiceCSS() {
    if (typeof chrome.runtime !== 'undefined' && chrome.runtime.getURL) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('/static/css/choiceform.css');
        document.head.appendChild(link);
    } else {
        console.error('chrome.runtime is undefined or getURL is not available.');
    }
}

// Rodo įkėlimo indikatorių


function removeChoiceTable() {
        const existingTable = document.querySelector(`.${TABLE_IDENTIFIER_CHOICE}`);
        if (existingTable) {
            existingTable.remove();
        }


}


function insertChoiceTableAfterInput(table) {
    const inputField = document.querySelector('input[data-my-custom-attr="USER_NAME_PASSWORD"]');
    if (inputField) {
        if (inputField.dataset.myCustomAttr === 'USER_NAME_PASSWORD') {
            inputField.insertAdjacentElement('afterend', table);

        }
    }
}

function insertChoiceFormAfterInput(form) {
    const inputField = document.querySelector('input[data-my-custom-attr="USER_NAME_PASSWORD"]');
    if (inputField) {
        if (inputField.dataset.myCustomAttr === 'USER_NAME_PASSWORD') {
            inputField.insertAdjacentElement('afterend', form);

        }
    }
}

document.addEventListener('click', function (event) {
    const target = event.target;
    const existingTable = document.querySelector(`.${TABLE_IDENTIFIER_CHOICE}`);

    // Check if the clicked target is outside the table and input fields with custom attributes
    if (existingTable && !existingTable.contains(target) && !(target.matches('input[data-my-custom-attr="USER_NAME_PASSWORD"], input[data-my-custom-attr="PASSWORD_NAME"]'))) {
        removeChoiceTable();
        removeAllChanges();
    }

});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        removeChoiceTable(); // Jei paspaustas ESC, pašaliname lentelę
        removeAllChanges();
    }
});

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
            addInputListeners();

        }
    });
});

// Pradėti stebėjimą
observer.observe(document.body, {childList: true, subtree: true});

// Pridėti listener pradiniams input elementams
addInputListeners();
