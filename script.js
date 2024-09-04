let apiKey = localStorage.getItem('apiKey') || '';
const apiKeyInput = document.getElementById('api-key-input');

let selectedModel = 'dev';

const modelUrls = {
    'dev': "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
    'schnell': "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
};

async function query(data) {
    const response = await fetch(
        modelUrls[selectedModel],
        {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.blob();
    return result;
}

function generateRandomSeed() {
    return Math.floor(Math.random() * 1000000);
}

function updateRangeValue(inputId) {
    const input = document.getElementById(inputId);
    const value = document.getElementById(`${inputId}-value`);
    value.textContent = input.value;
}

function toggleImageInfo(show) {
    const imageInfo = document.getElementById('image-info');
    const generationTime = document.getElementById('generation-time');
    if (show) {
        imageInfo.classList.remove('hidden');
        generationTime.classList.remove('hidden');
    } else {
        imageInfo.classList.add('hidden');
        generationTime.classList.add('hidden');
    }
}

async function translateText(text) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0];
}

document.addEventListener('DOMContentLoaded', () => {
    toggleImageInfo(false);
    ['num_inference_steps'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => updateRangeValue(id));
    });

    document.querySelectorAll('.model-option').forEach(option => {
        option.addEventListener('click', function() {
            selectedModel = this.dataset.model;
            document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
});

async function generateImage() {
    const prompt = document.getElementById('prompt').value;
    if (!prompt) {
        alert('Бля, введи хоть что-нибудь в промпт!');
        return;
    }

    const generateButton = document.getElementById('generate');
    const resultImage = document.getElementById('result');
    const loader = document.getElementById('loader');
    const imageInfo = document.getElementById('image-info');

    generateButton.disabled = true;
    generateButton.textContent = 'Генерация...';
    resultImage.style.opacity = '0';
    loader.classList.remove('hidden');
    toggleImageInfo(false);

    const startTime = performance.now();

    try {
        const translatedPrompt = await translateText(prompt);
        console.log('Переведенный промпт:', translatedPrompt);

        const seed = generateRandomSeed();
        let data = { 
            "inputs": translatedPrompt,
            "parameters": {
                "seed": seed,
                "height": parseInt(document.getElementById('height').value),
                "width": parseInt(document.getElementById('width').value),
                "num_inference_steps": parseInt(document.getElementById('num_inference_steps').value)
            }
        };

        const response = await query(data);
        const imageUrl = URL.createObjectURL(response);
        
        const img = new Image();
        img.onload = () => {
            resultImage.src = imageUrl;
            resultImage.classList.add('fade-in');
            resultImage.style.opacity = '';
            loader.classList.add('hidden');
            
            imageInfo.innerHTML = `
                <strong>Настройки:</strong><br>
                Промпт: ${prompt}<br>
                Переведенный промпт: ${translatedPrompt}<br>
                Размер: ${data.parameters.width}x${data.parameters.height}<br>
                Inference Steps: ${data.parameters.num_inference_steps}<br>
                Seed: ${data.parameters.seed}<br>
                Модель: ${selectedModel}
            `;

            const endTime = performance.now();
            const generationTime = ((endTime - startTime) / 1000).toFixed(2);
            document.getElementById('generation-time').textContent = `Время генерации: ${generationTime} секунд`;
            toggleImageInfo(true);
        };
        img.src = imageUrl;
    } catch (error) {
        alert('Бля, что-то пошло по пизде: ' + error.message);
        resultImage.style.opacity = '1';
        loader.classList.add('hidden');
        toggleImageInfo(false);
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Сгенерировать';
    }
}

document.getElementById('generate').addEventListener('click', generateImage);

function showPopup() {
    const popup = document.getElementById('api-key-popup');
    popup.classList.remove('hidden', 'hide');
    popup.classList.add('show');
}

function hidePopup() {
    const popup = document.getElementById('api-key-popup');
    popup.classList.add('hide');
    popup.addEventListener('animationend', function() {
        popup.classList.add('hidden');
        popup.classList.remove('show', 'hide');
    }, { once: true });
}

document.getElementById('api-key-btn').addEventListener('click', () => {
    apiKey = localStorage.getItem('apiKey') || '';
    apiKeyInput.value = apiKey;
    showPopup();
});

document.getElementById('save-api-key').addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    localStorage.setItem('apiKey', apiKey);
    hidePopup();
});

document.getElementById('api-key-popup').addEventListener('click', (e) => {
    if (e.target.id === 'api-key-popup') {
        hidePopup();
    }
});
