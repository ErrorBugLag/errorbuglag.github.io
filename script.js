async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
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

function populateResolutionOptions(selectId) {
    const select = document.getElementById(selectId);
    for (let i = 128; i <= 2048; i += 32) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }
}

function updateRangeValue(inputId) {
    const input = document.getElementById(inputId);
    const value = document.getElementById(`${inputId}-value`);
    value.textContent = input.value;
}

document.addEventListener('DOMContentLoaded', () => {
    populateResolutionOptions('width');
    populateResolutionOptions('height');

    ['guidance_scale', 'num_inference_steps'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => updateRangeValue(id));
    });
});

document.getElementById('generate').addEventListener('click', async () => {
    const prompt = document.getElementById('prompt').value;
    if (!prompt) {
        alert('Пожалуйста, введите описание изображения');
        return;
    }

    const generateButton = document.getElementById('generate');
    const resultImage = document.getElementById('result');
    const loader = document.getElementById('loader');

    generateButton.disabled = true;
    generateButton.textContent = 'Генерация...';
    resultImage.style.opacity = '0.5';
    loader.classList.remove('hidden');

    try {
        const seed = generateRandomSeed();
        const width = parseInt(document.getElementById('width').value);
        const height = parseInt(document.getElementById('height').value);
        const guidance_scale = parseFloat(document.getElementById('guidance_scale').value);
        const num_inference_steps = parseInt(document.getElementById('num_inference_steps').value);

        const response = await query({
            "inputs": prompt,
            "parameters": {
                "seed": seed,
                "height": height,
                "width": width,
                "guidance_scale": guidance_scale,
                "num_inference_steps": num_inference_steps
            }
        });
        const imageUrl = URL.createObjectURL(response);
        
        const img = new Image();
        img.onload = () => {
            resultImage.src = imageUrl;
            resultImage.style.opacity = '1';
            loader.classList.add('hidden');
        };
        img.src = imageUrl;
    } catch (error) {
        alert('Произошла ошибка: ' + error.message);
        resultImage.style.opacity = '1';
        loader.classList.add('hidden');
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Сгенерировать';
    }
});

document.getElementById('api-key-btn').addEventListener('click', () => {
    document.getElementById('api-key-popup').classList.remove('hidden');
});

document.getElementById('save-api-key').addEventListener('click', () => {
    apiKey = document.getElementById('api-key-input').value.trim();
    document.getElementById('api-key-popup').classList.add('hidden');
});
