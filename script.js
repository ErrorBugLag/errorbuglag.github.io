let apiKey = localStorage.getItem('apiKey') || '';
const apiKeyInput = document.getElementById('api-key-input');

let selectedModel = 'schnell';

const modelUrls = {
    'dev': "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
    'schnell': "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
};

const query = async (data) => {
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
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.blob();
};

const generateRandomSeed = () => Math.floor(Math.random() * 1000000);

const updateRangeValue = (inputId) => {
    const input = document.getElementById(inputId);
    const value = document.getElementById(`${inputId}-value`);
    value.textContent = input.value === "0" ? "Авто" : input.value;
};

const toggleImageInfo = (show) => {
    const imageInfo = document.getElementById('image-info');
    const generationTime = document.getElementById('generation-time');
    imageInfo.classList.toggle('hidden', !show);
    generationTime.classList.toggle('hidden', !show);
};

const translateText = async (text) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data[0][0][0];
};

document.addEventListener('DOMContentLoaded', () => {
    toggleImageInfo(false);
    ['num_inference_steps'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => updateRangeValue(id));
    });

    document.querySelectorAll('input[name="model"]').forEach(option => {
        option.addEventListener('change', function() {
            selectedModel = this.value;
        });
    });

    // Сброс выбора модели на 'schnell'
    document.querySelector('input[name="model"][value="schnell"]').checked = true;
    selectedModel = 'schnell';

    // Сброс шагов на значение 5
    const stepsInput = document.getElementById('num_inference_steps');
    stepsInput.value = 5;
    updateRangeValue('num_inference_steps');
});

const generateImage = async (event) => {
    event.preventDefault();
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
        const data = { 
            "inputs": translatedPrompt,
            "parameters": {
                "seed": seed,
                "height": parseInt(document.getElementById('height').value),
                "width": parseInt(document.getElementById('width').value)
            }
        };

        const steps = parseInt(document.getElementById('num_inference_steps').value);
        if (steps > 0) {
            data.parameters.num_inference_steps = steps;
        }

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
                Inference Steps: ${steps > 0 ? steps : 'Авто'}<br>
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
        alert('Error: ' + error.message);
        resultImage.style.opacity = '1';
        loader.classList.add('hidden');
        toggleImageInfo(false);
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Сгенерировать';
    }
};

document.getElementById('generation-form').addEventListener('submit', generateImage);

const showPopup = () => {
    const popup = document.getElementById('api-key-popup');
    popup.classList.remove('hidden', 'hide');
    popup.classList.add('show');
};

const hidePopup = () => {
    const popup = document.getElementById('api-key-popup');
    popup.classList.add('hide');
    popup.addEventListener('animationend', function() {
        popup.classList.add('hidden');
        popup.classList.remove('show', 'hide');
    }, { once: true });
};

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
