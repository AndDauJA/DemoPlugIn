function checkSession() {
    return 'https://www.brigama.lt/checkSession';
}
function usernameFromServerUrl() {
    return 'https://www.brigama.lt/api/getUsernameFromFile';
}
function setExtentionId() {
    return 'https://www.brigama.lt/set-extension-id';
}

function checkUserName(username){
    return `https://www.brigama.lt/api/checkUsername/${username}`;
}

function addDataToDataBase(){
    return 'https://www.brigama.lt/api/getrecord/addto/database';
}
function redirectToLoginPage() {
    chrome.tabs.create({url: 'https://www.brigama.lt/login'});
}
function fetchUserDataFromDataBase(){
    return 'https://www.brigama.lt/api/database/userdata';
}
function decryptedKey(userData){
    return `https://www.brigama.lt/api/decrypted-key/${userData.uuid}`;
}
function isHomePage(url) {
    return url.includes('https://www.brigama.lt/login');
}