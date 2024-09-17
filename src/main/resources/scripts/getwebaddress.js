function setWebAddress() {
    // var webAddressField = document.getElementById("webaddress-field");
    // var webMetadataField = document.getElementById("webmetadata-field");

    if (webAddressField) {
        var fullUrl = window.location.href;
        var regex = /^(https?:\/\/(?:[\w-]+\.)+[\w-]{2,3}\.[a-z]{2,})/;
        var matches = fullUrl.match(regex);

        if (matches && matches[0]) {
            webAddressField.value = matches[0];
        } else {
            webAddressField.value = fullUrl; // Fallback to the full URL if the regex doesn't match
        }

        // Nustatyti web metadata
        if (webMetadataField) {
            webMetadataField.value = matches ? matches[0] : fullUrl;
        }
    }
}

window.onload = setWebAddress;

document.addEventListener('click', function (event) {
    const target = event.target;

       if ((target.tagName === 'INPUT') && !isHomePage(window.location.href)) {
        if (target.id === 'webaddress-field') {
            setWebAddress();
        }
    }
});