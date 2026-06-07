function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Generar hash de texto
document.getElementById('generateBtn')?.addEventListener('click', async () => {
    const texto = document.getElementById('inputText').value;
    const algoritmo = document.getElementById('algoritmo').value;
    const salt = document.getElementById('salt').value;
    
    if (!texto) {
        alert('❌ Escribe algo para hashear');
        return;
    }
    
    const response = await fetch('/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, algoritmo, salt })
    });
    
    const data = await response.json();
    if (data.hash) {
        document.getElementById('result').innerText = data.hash;
    } else {
        alert('Error: ' + data.error);
    }
});

// Hashear archivo
document.getElementById('hashFileBtn')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const algoritmo = document.getElementById('algoritmoFile').value;
    const salt = document.getElementById('saltFile').value;
    
    if (!fileInput.files.length) {
        alert('❌ Selecciona un archivo');
        return;
    }
    
    const formData = new FormData();
    formData.append('archivo', fileInput.files[0]);
    formData.append('algoritmo', algoritmo);
    formData.append('salt', salt);
    
    const response = await fetch('/hash-file', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    if (data.hash) {
        document.getElementById('fileResult').innerText = `${data.nombre}\nHash: ${data.hash}`;
    } else {
        alert('Error: ' + data.error);
    }
});

// Comparar hashes
document.getElementById('compareBtn')?.addEventListener('click', async () => {
    const hash1 = document.getElementById('hash1').value.trim();
    const hash2 = document.getElementById('hash2').value.trim();
    
    if (!hash1 || !hash2) {
        alert('❌ Ingresa ambos hashes');
        return;
    }
    
    const response = await fetch('/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash1, hash2 })
    });
    
    const data = await response.json();
    const resultado = data.iguales ? '✅ ¡Los hashes son IGUALES!' : '❌ Los hashes son DIFERENTES';
    document.getElementById('compareResult').innerHTML = `<strong>Resultado:</strong><br>${resultado}`;
});

// Funciones de copiar
document.getElementById('copyBtn')?.addEventListener('click', () => {
    const hash = document.getElementById('result').innerText;
    if (hash) copyToClipboard(hash);
});

document.getElementById('copyFileBtn')?.addEventListener('click', () => {
    const hashText = document.getElementById('fileResult').innerText;
    const hash = hashText.split('Hash: ')[1];
    if (hash) copyToClipboard(hash);
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('✅ Hash copiado');
}
