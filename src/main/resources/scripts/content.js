// content.js

document.getElementById("myH").addEventListener("click", generateTable2);
document.getElementById("myH").innerHTML = "JavaScript Comments";

function generateTable() {
    const paragraph = document.getElementById("myP")
    paragraph.innerHTML =`
        <html>
        <style>
            table {
            background-color: powderblue;
        }
        </style>
        <table>
            <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Country</th>
            </tr>
            <tr>
                <td>Alfreds Futterkiste</td>
                <td>Maria Anders</td>
                <td>Germany</td>
            </tr>
            <tr>
                <td>Centro comercial Moctezuma</td>
                <td>Francisco Chang</td>
                <td>Mexico</td>
            </tr>
        </table>
        </html>`;
}

// Attach the doIt function to the onclick event of the element with the id "myH"

function generateTable2() {
    const headerRow = document.getElementById("myP");
        headerRow.innerHTML = `
    <tr>
        <th>Vartotojo vardas</th>
        <th>URL</th>
        <th>Generated Key</th>
        <th>Pastabos</th>
        </tr>
    `;
    table.appendChild(headerRow);

    userDataList.forEach(userData => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${userData.userNameEmail}</td>
            <td>${userData.webaddress}</td>
            <td>${userData.generatedkey}</td>
            <td>${userData.notes}</td>
        `;
        table.appendChild(row);
    });

    return table;
}