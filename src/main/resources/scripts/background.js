// background.js

function fetchUserData() {
    // fetch('http://localhost:8080/api/database/userdata')
    fetch('https://brigama.lt/api/database/userdata')
        .then(response => {
            if (!response.ok) {
                throw new Error('Serverio klaida');
            }
            return response.json();
        })
        .then(userDataList => {
            const promises = userDataList.map((userData, index) => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        // fetch(`http://localhost:8080/api/decrypted-key/${userData.uuid}`)
                        fetch(`https://brigama.lt/api/decrypted-key/${userData.uuid}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Serverio klaida');
                                }
                                return response.text();
                            })
                            .then(decryptedKey => {
                                userData.decryptedKey = decryptedKey;
                                resolve(userData); // Žymime užduotį kaip baigtą
                            })
                            .catch(error => {
                                console.error('Klaida gaviant dešifruotą raktą:', error);
                                reject(error); // Jei įvyko klaida, žymime užduotį kaip nepavykusi
                            });
                    }, index * 100); // Pridedame papildomą laiko atidėjimą pagal užduočių numerius
                });
            });

            // Palaukiame visų promises užbaigimo
            Promise.all(promises)
                .then(() => {
                    callGenerateTable(userDataList);
                });
        })
}


function callGenerateTable(userDataList) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'generateTable', userDataList: userDataList});

    });
}

// ====================================veikianti versija====================================

// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//     if (message.action === 'checkSession') {
//
//         // fetch('http://localhost:8080/checkSession')
//         fetch('http://localhost:8080/checkSession', {mode: 'no-cors'})
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Serverio klaida');
//                 }
//                 return response.text();
//             })
//             .then(data => {
//                 if (data === 'Prisijungęs') {
//                     fetchUserData();
//                 } else {
//
//                     chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
//                         if (tabs.length > 0) {
//                             chrome.tabs.sendMessage(tabs[0].id, {action: 'hideTheLoadingSpinner'}, function (response) {
//                                 if (chrome.runtime.lastError) {
//                                     console.error("Error sending message:", chrome.runtime.lastError);
//                                 } else {
//
//                                     redirectToLoginPage();
//                                 }
//                             });
//                         } else {
//                             console.error("No active tabs found.");
//                         }
//                     });
//                     console.log('Neprisijungęs, formos nebuvo atidaryta.');
//                 }
//             })
//             .catch(error => console.error('Klaida:', error));
//     }
// });


// ===================== veikiantis============================

function redirectToLoginPage() {
    // chrome.tabs.create({url: 'http://localhost:8080/login'});
    chrome.tabs.create({url: 'https://brigama.lt/login'});
}

let isActivated = false; // Pradinė būsena - neaktyvuota

function executeScriptsIfNeeded() {
    if (isActivated) { // Jei neaktyvuota, nedaryti nieko
        // if (!isActivated) {
        //     // Jei plėtinys neaktyvuotas, nedaryti nieko
        //     return;
        // }
        const scripts = [
            "scripts/icon.js",
            "scripts/getwebaddress.js",
            "scripts/formchoices.js",
            "scripts/loadtimespinner.js",
            "scripts/inputForm.js",
            "scripts/formPlugin.js",
            "scripts/passwordForm.js",
            "scripts/logintodb.js",

        ];

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            tabs.forEach(tab => {
                const url = new URL(tab.url);
                if (url.protocol === 'chrome:' || url.protocol === 'about:') {
                    console.log(`Skipping tab with URL ${tab.url}`);
                    return;
                }

                scripts.forEach(script => {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        files: [script]
                    }, function (results) {
                        if (chrome.runtime.lastError) {
                            console.error('Script injection error:', chrome.runtime.lastError.message);
                        } else {
                            console.log(`Injected ${script} into tab ${tab.id}`);
                        }
                    });
                });
            });
        });
    }

}

function reloadActiveTabs() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        tabs.forEach(tab => {
            const url = new URL(tab.url);
            if (url.protocol === 'chrome:' || url.protocol === 'about:') {
                console.log(`Skipping tab reload with URL ${tab.url}`);
                return;
            }
            chrome.tabs.reload(tab.id);
        });
    });
}


chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({isActive: isActivated}, function () {
        console.log('Extension is initialized to inactive');
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'change_button_color') {
        chrome.storage.local.set({buttonColor: message.color}, function () {
            console.log('Button color changed to ' + message.color);
        });
    } else if (message.action === 'change_extension_status') {
        isActivated = message.isActive;
        chrome.storage.local.set({isActive: isActivated}, function () {
            console.log('Extension status changed to ' + (isActivated ? 'active' : 'inactive'));
            if (isActivated) {
                executeScriptsIfNeeded(); // Įvykdyti skriptus, kai plėtinys aktyvuotas
            } else {
                reloadActiveTabs(); // Persikrauti tab'us, kai plėtinys deaktyvuotas
            }
        });
    }
});

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     if (request.action === 'sendUsernameAndPassword') {
//         // const username = request.data;
//         const {username, password, webAddress, webmetadata} = request.data;
//         // Patikriname prisijungimą
//         fetch('http://localhost:8080/checkSession')
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Failed to check session status.');
//                 }
//                 return response.text(); // Grąžina teksto atsakymą ("Prisijungęs" arba "Neprisijungęs")
//             })
//             .then(sessionStatus => {
//                 if (sessionStatus === 'Prisijungęs') {
//                     // Toliau vykdomas duomenų siuntimas į serverį
//                     chrome.storage.local.get(['csrfToken'], function (result) {
//                         const csrfToken = result.csrfToken;
//                         console.error('CSRF Token:', csrfToken); // Log the CSRF token
//
//                         fetch('http://localhost:8080/api/getrecord/addto/database', {
//                             method: 'POST',
//                             headers: {
//                                 'Content-Type': 'application/json',
//                                 'X-CSRF-TOKEN': csrfToken,
//                             },
//                             body: JSON.stringify({
//                                 userNameEmail: username,
//                                 generatedkey: password,
//                                 webaddress: webAddress,
//                                 webmetadata: webmetadata
//                             }),
//                             credentials: 'include',
//                         })
//                             .then(response => {
//                                 if (!response.ok) {
//                                     throw new Error(`HTTP error! Status: ${response.status}`);
//                                 }
//                                 return response.json();
//                             })
//                             .then(data => {
//                                 console.log('Success:', data);
//                                 chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
//                                     chrome.tabs.sendMessage(tabs[0].id, {
//                                         action: 'showSuccessMessage',
//                                         message: 'Data saved successfully.'
//                                     });
//                                 });
//                                 sendResponse({status: 'success', data: data});
//                             })
//                             .catch(error => {
//                                 console.error('Error:', error);
//                                 chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
//                                     chrome.tabs.sendMessage(tabs[0].id, {
//                                         action: 'showErrorMessage',
//                                         message: 'Error saving data.'
//                                     });
//                                 });
//                                 sendResponse({status: 'error', error: error.message});
//                             });
//                     });
//                 } else {
//                     redirectToLoginPage();
//                     throw new Error('User not authenticated. Please login.');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 sendResponse({status: 'error', error: error.message});
//             });
//
//         // Return true to indicate you want to send a response asynchronously
//         return true;
//     }
// });
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'sendUsernameAndPassword') {
        const {username, password, webAddress, webmetadata} = request.data;

        // Patikriname prisijungimą
        // fetch('http://localhost:8080/checkSession', {
        fetch('https://brigama.lt/checkSession', {
            method: 'GET',
            credentials: 'include' // Reikia pridėti, kad serveris galėtų matyti sesijos informaciją
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to check session status.');
                }
                return response.text();
            })
            .then(sessionStatus => {
                if (sessionStatus === 'Prisijungęs') {
                    // Toliau vykdomas duomenų siuntimas į serverį
                    chrome.storage.local.get(['csrfToken'], function (result) {
                        const csrfToken = result.csrfToken;
                        // console.error('CSRF Token:', csrfToken);

                        // fetch('http://localhost:8080/api/getrecord/addto/database', {
                        fetch('https://brigama.lt/api/getrecord/addto/database', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                            },
                            body: JSON.stringify({
                                userNameEmail: username,
                                generatedkey: password,
                                webaddress: webAddress,
                                webmetadata: webmetadata
                            }),
                            credentials: 'include',
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                console.log('Success:', data);
                                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                                    chrome.tabs.sendMessage(tabs[0].id, {
                                        action: 'showSuccessMessage',
                                        message: 'Data saved successfully.'
                                    });
                                });
                                sendResponse({status: 'success', data: data});
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                                    chrome.tabs.sendMessage(tabs[0].id, {
                                        action: 'showErrorMessage',
                                        message: 'Error saving data.'
                                    });
                                });
                                sendResponse({status: 'error', error: error.message});
                            });
                    });
                } else {
                    // Jei naudotojas neprisijungęs, nukreipti į prisijungimo puslapį
                    redirectToLoginPage();
                    throw new Error('User not authenticated. Please login.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                sendResponse({status: 'error', error: error.message});
            });

        // Return true to indicate you want to send a response asynchronously
        return true;
    }
});


function validateUsername(username, sendUsernameCallback) {
    // fetch(`http://localhost:8080/api/checkUsername/${username}`)
    fetch(`https://brigama.lt/api/checkUsername/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                sendUsernameCallback({isValid: false});
            } else {
                sendUsernameCallback({isValid: true, username});
            }
        })
        .catch(error => {
            console.error('Error:', error);
            sendUsernameCallback({error: error.message});
        });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'validateUsername') {
        const {username} = request.data;

        // Patikrinkite vartotojo vardą savo serverio dalyje
        // fetch(`http://localhost:8080/api/checkUsername/${username}`)
        fetch(`https://brigama.lt/api/checkUsername/${username}`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    sendResponse({status: 'success', isValid: false});
                } else {
                    sendResponse({status: 'success', isValid: true});
                }
            })
            .catch(error => {
                console.error('Error:', error);
                sendResponse({status: 'error', error: error.message});
            });

        // Return true to indicate you want to send a response asynchronously
        return true;
    }
});

// =============== 1 varianatas kai veikia save to db

// chrome.runtime.onInstalled.addListener(() => {
//     // Pirmiausia, gaukite UUID iš serverio
//     // fetch('http://localhost:8080/get-client-uuid')
//     fetch('https://brigama.lt/get-client-uuid')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Nepavyko gauti UUID');
//             }
//             return response.text(); // UUID grąžinamas kaip tekstas
//         })
//         .then(clientUuid => {
//             // Įrašykite `extensionId` į local storage
//             chrome.storage.local.set({extensionId: chrome.runtime.id}, () => {
//                 // Atlikite POST užklausą su `extensionId` ir `clientUuid`
//                 // fetch('http://localhost:8080/set-extension-id', {
//                 fetch('https://brigama.lt/set-extension-id', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         extensionId: chrome.runtime.id,
//                         clientUuid: clientUuid // Įtraukite `clientUuid` į užklausą
//                     }),
//                 })
//                     .then(response => {
//                         if (!response.ok) {
//                             throw new Error('Nepavyko nustatyti extensionId');
//                         }
//                         console.log('extensionId sėkmingai nustatytas');
//
//                         // Atlikite užklausą gauti `extensionId`
//                         // fetch(`http://localhost:8080/get-extension-id?clientUUID=${clientUuid}`)
//                         fetch(`https://brigama.lt/get-extension-id?clientUUID=${clientUuid}`)
//                             .then(response => {
//                                 if (!response.ok) {
//                                     throw new Error('Nepavyko gauti extensionId');
//                                 }
//                                 return response.text();
//                             })
//                             .then(extensionId => {
//                                 // Įrašykite gautą `extensionId` į local storage
//                                 chrome.storage.local.set({extensionId: extensionId}, () => {
//                                     // Atnaujinkite visus skirtukus su nauju `extensionId`
//                                     chrome.tabs.query({}, (tabs) => {
//                                         tabs.forEach((tab) => {
//                                             chrome.tabs.reload(tab.id);
//                                         });
//                                     });
//                                 });
//                             })
//                             .catch(error => {
//                                 console.error('Klaida gaunant extensionId:', error);
//                             });
//                     })
//                     .catch(error => {
//                         console.error('Klaida nustatant extensionId:', error);
//                     });
//             });
//         })
//         .catch(error => {
//             console.error('Klaida gaunant UUID:', error);
//         });
// });

// chrome.runtime.onInstalled.addListener(() => {
//     // Pirmiausia, gaukite UUID iš serverio
//     fetch('https://brigama.lt/get-client-uuid')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Nepavyko gauti UUID');
//             }
//             return response.text(); // UUID grąžinamas kaip tekstas
//         })
//         .then(clientUuid => {
//             // Patikrinkite, ar extensionId jau yra local storage
//             chrome.storage.local.get(['extensionId'], (result) => {
//                 if (result.extensionId) {
//                     console.log('extensionId jau yra local storage:', result.extensionId);
//                     return; // Jei jau yra, nieko nedaryti
//                 }
//
//                 // Jei nėra, įrašykite extensionId į local storage
//                 chrome.storage.local.set({extensionId: chrome.runtime.id}, () => {
//                     // Atlikite POST užklausą su extensionId ir clientUuid
//                     fetch('https://brigama.lt/set-extension-id', {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             extensionId: chrome.runtime.id,
//                             clientUuid: clientUuid // Įtraukite clientUuid į užklausą
//                         }),
//                     })
//                         .then(response => {
//                             if (!response.ok) {
//                                 throw new Error('Nepavyko nustatyti extensionId');
//                             }
//                             console.log('extensionId sėkmingai nustatytas');
//
//                             // Atlikite užklausą gauti extensionId
//                             fetch(`https://brigama.lt/get-extension-id?clientUUID=${clientUuid}`)
//                                 .then(response => {
//                                     if (!response.ok) {
//                                         throw new Error('Nepavyko gauti extensionId');
//                                     }
//                                     return response.text();
//                                 })
//                                 .then(extensionId => {
//                                     // Įrašykite gautą extensionId į local storage
//                                     chrome.storage.local.set({extensionId: extensionId}, () => {
//                                         // Atnaujinkite visus skirtukus su nauju extensionId
//                                         chrome.tabs.query({}, (tabs) => {
//                                             tabs.forEach((tab) => {
//                                                 chrome.tabs.reload(tab.id);
//                                             });
//                                         });
//                                     });
//                                 })
//                                 .catch(error => {
//                                     console.error('Klaida gaunant extensionId:', error);
//                                 });
//                         })
//                         .catch(error => {
//                             console.error('Klaida nustatant extensionId:', error);
//                         });
//                 });
//             });
//         })
//         .catch(error => {
//             console.error('Klaida gaunant UUID:', error);
//         });
// });
chrome.runtime.onInstalled.addListener(() => {
    // Pirmiausia, gaukite UUID iš serverio
    fetch('https://brigama.lt/get-client-uuid')
        .then(response => {
            if (!response.ok) {
                throw new Error('Nepavyko gauti UUID');
            }
            return response.text(); // UUID grąžinamas kaip tekstas
        })
        .then(clientUuid => {
            // Patikrinkite, ar extensionId jau yra local storage
            chrome.storage.local.get(['extensionId'], (result) => {
                if (result.extensionId) {
                    console.log('extensionId jau yra local storage:', result.extensionId);
                    return; // Jei jau yra, nieko nedaryti
                }

                // Jei nėra, įrašykite extensionId į local storage
                chrome.storage.local.set({extensionId: chrome.runtime.id}, () => {
                    // Atlikite POST užklausą su extensionId ir clientUuid
                    fetch('https://brigama.lt/set-extension-id', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            extensionId: chrome.runtime.id,
                            clientUuid: clientUuid // Įtraukite clientUuid į užklausą
                        }),
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Nepavyko nustatyti extensionId');
                            }
                            console.log('extensionId sėkmingai nustatytas');
                        })
                        .catch(error => {
                            //TODO meta klaida kad neranda extentionId nors ji randa ir iraso i db
                            console.log('Klaida nustatant extensionId:', error);
                        });
                });
            });
        })
        .catch(error => {
            console.error('Klaida gaunant UUID:', error);
        });
});


chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'checkSessionatStart') {
        checkSessionAtStart()
            .then(isLoggedIn => {
                if (isLoggedIn) {
                    sendResponse({status: 'loggedIn'});
                } else {
                    sendResponse({status: 'loggedOut'});
                }
            })
            .catch(error => {
                console.error('Error:', error);
                sendResponse({status: 'error', message: error.message});
            });
        return true; // Indicates that we will respond asynchronously
    } else if (message.action === 'checkSession') {

        // fetch('http://localhost:8080/checkSession', {mode: 'no-cors'})
        fetch('https://brigama.lt/checkSession', {mode: 'no-cors'})
            .then(response => {
                if (!response.ok) {
                    throw new Error('Serverio klaida');
                }
                return response.text();
            })
            .then(data => {
                if (data === 'Prisijungęs') {
                    fetchUserData();
                } else {
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        if (tabs.length > 0) {
                            chrome.tabs.sendMessage(tabs[0].id, {action: 'hideTheLoadingSpinner'}, function (response) {
                                if (chrome.runtime.lastError) {
                                    console.error("Error sending message:", chrome.runtime.lastError);
                                } else {
                                    redirectToLoginPage();
                                }
                            });
                        } else {
                            console.error("No active tabs found.");
                        }
                    });
                    console.log('Neprisijungęs, formos nebuvo atidaryta.');
                }
            })
            .catch(error => console.error('Klaida:', error));
    }
});


async function getUsernameFromServer() {
    // const usernameFromServerUrl = 'http://localhost:8080/api/getUsernameFromFile';

    try {
        // const response = await fetch('http://localhost:8080/api/getUsernameFromFile', {
        const response = await fetch('https://brigama.lt/api/getUsernameFromFile', {
            method: 'GET',
            mode: 'cors',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch username from server');
        }

        const data = await response.json();
        return data.username.trim();
    } catch (error) {
        console.error('Error reading username from server:', error.message);
        return null;
    }
}

// Message listener to respond to content.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'getUsername') {
        const username = await getUsernameFromServer();
        sendResponse({username});
    }
});

//================= check Login and session=============================
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({'loggedIn': false});
    checkSessionAtStart()
        .then(isLoggedIn => {
            if (isLoggedIn) {
                chrome.action.setPopup({popup: 'templates/brigama/form.html'});
            } else {
                chrome.action.setPopup({popup: 'templates/brigama/pluginlogin.html'});
            }
        });
});
chrome.action.onClicked.addListener(function () {
    chrome.storage.local.get(['loggedIn'], function (result) {
        if (result.loggedIn) {
            chrome.action.setPopup({popup: 'templates/brigama/form.html'});
        } else {
            chrome.action.setPopup({popup: 'templates/brigama/pluginlogin.html'});
        }
    });
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'setLoggedIn') {
        chrome.storage.local.set({'loggedIn': true}, function () {
            chrome.action.setPopup({popup: 'templates/brigama/form.html'});
            sendResponse({status: 'success'});
        });
    }
    return true; // Keeps the messaging channel open for sendResponse
});


function checkSessionAtStart() {

    // return fetch('http://localhost:8080/checkSession')
    return fetch('https://brigama.lt/checkSession')
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error');
            }
            return response.text();
        })
        .then(data => {
            if (data !== 'Prisijungęs') {
                redirectToLoginPage();
                return false;
            }
            return true;
        })
        .catch(error => {
            console.error('Error:', error);
            redirectToLoginPage();
            return false;
        });
}








