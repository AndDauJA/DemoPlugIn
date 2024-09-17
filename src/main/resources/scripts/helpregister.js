
function generateRegistrationForm(language) {
    const formNames = {
        lt: "UAB Brigama Slaptažodžių valdytojas",
        en: "UAB Brigama Password Manager EN",
    };

    const formName = formNames[language] || formNames.en;

    const formchoicesone = {
        lt: "Kurti naują slapyvardį/slaptažodį",
        en: "Save new username/password",
    };
    const formchoicestwo = {
        lt: "Atsaukti irasa",
        en: "Cancle record",
    };

    const form = document.createElement('form');
    const choiceFormName = getTableName(formName);
    const formchoiceone = getTableName(formchoicesone);
    const formchoicetwo = getTableName(formchoicestwo);
    form.innerHTML = `
        <table>
            <tr>
                <th class="register-form" colspan="2">${choiceFormName}</th>
            </tr>
            <tr>
                <td class="choice-table-td"><button id="create-password" class="a-btn">${formchoiceone}</button></td>
                <td class="choice-table-td"><button id="cancel-creation" class="a-btn">${formchoicetwo}</button></td>
            </tr>
        </table>
    `;
    insertChoiceFormAfterInput(form);
    form.classList.add(FORM_IDENTIFIER_CHOICE);
    loadchoiceCSS();


    document.getElementById('create-password').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default form submission
        generateInputForm();
    });
    document.getElementById('cancel-creation').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default form submission
        cancelCreationButtonClickHandler();
    });
}

function cancelCreationButtonClickHandler() {
    removeRegistrationForm();
    removeAllChanges();
}

function removeRegistrationForm() {
    const existingForm = document.querySelector(`.${FORM_IDENTIFIER_CHOICE}`);
    if (existingForm) {
        existingForm.remove();
    }

}

