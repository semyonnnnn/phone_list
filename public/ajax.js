document.getElementById('excel_file').addEventListener('change', worker);

function displayMessage(text, isError = false) {
    const status = document.getElementById('status');

    status.textContent = text;

    status.style.color = isError ? "#ff0000" : "#00ff00";
    status.classList.toggle('hidden', !text);
}

async function worker() {
    const fileInput = this;
    const file = fileInput.files[0];

    try {
        // --- Phase 1: Local Validation ---
        if (!file) {
            throw new Error("файл не выбран.");
        }

        displayMessage("загрузка..."); // Feedback for the user

        // --- Phase 2: The Network Request ---
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            // This jumps to the catch block below
            throw new Error(data.error || "ошибка сервера");
        }

        // --- Phase 3: Success ---
        displayMessage("успех: " + JSON.stringify(data));

    } catch (error) {
        // --- PHASE 4: THE ONE STOP SHOP FOR ERRORS ---
        // Whether it was a missing file, a network crash, 
        // or a server 500 error, it ALL ends up here.
        displayMessage("ошибка: " + error.message, true);
    }
}