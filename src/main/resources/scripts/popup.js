document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const extensionId = e.target.result.trim();
            sendExtensionIdToServer(extensionId);
        };
        reader.readAsText(file);
    }
}

function sendExtensionIdToServer(extensionId) {
    fetch('https://brigama.lt/set-extension-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extensionId: extensionId }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to set extensionId');
            }
            console.log('extensionId successfully set');
        })
        .catch(error => {
            console.error('Error setting extensionId:', error);
        });
}
