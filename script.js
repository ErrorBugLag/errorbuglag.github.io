let apiKey=localStorage.getItem('apiKey')||'',selectedModel='schnell',modelUrls={dev:"https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",schnell:"https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"};const roundTo32=n=>Math.round(n/32)*32,query=async d=>{const r=await fetch(modelUrls[selectedModel],{headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},method:"POST",body:JSON.stringify(d)});if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);return r.blob()},generateRandomSeed=()=>Math.floor(1e6*Math.random()),updateRangeValue=i=>{const e=document.getElementById(i),t=document.getElementById(`${i}-value`);t.textContent="0"===e.value?"Авто":e.value},toggleImageInfo=s=>{const e=document.getElementById('image-info'),t=document.getElementById('generation-time');e.classList.toggle('hidden',!s),t.classList.toggle('hidden',!s)},translateText=async t=>{const r=await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(t)}`);if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);return(await r.json())[0][0][0]};document.addEventListener('DOMContentLoaded',()=>{toggleImageInfo(!1),['num_inference_steps'].forEach(e=>{document.getElementById(e).addEventListener('input',()=>updateRangeValue(e))}),document.querySelectorAll('input[name="model"]').forEach(e=>{e.addEventListener('change',function(){selectedModel=this.value})}),document.querySelector('input[name="model"][value="schnell"]').checked=!0,selectedModel='schnell';const e=document.getElementById('num_inference_steps');e.value=0,updateRangeValue('num_inference_steps'),[document.getElementById('width'),document.getElementById('height')].forEach(e=>{e.addEventListener('change',function(){this.value=roundTo32(parseInt(this.value))})}),document.getElementById('prompt').addEventListener('keydown',e=>{"Enter"===e.key&&!e.shiftKey&&(e.preventDefault(),generateImage(new Event('submit')))})});const generateImage=async e=>{e.preventDefault();const t=document.getElementById('prompt').value;if(!t)return void alert('Бля, введи хоть что-нибудь в промпт!');const n=document.getElementById('generate'),o=document.getElementById('result'),a=document.getElementById('loader'),i=document.getElementById('image-info'),d=document.getElementById('image-link');n.disabled=!0,n.textContent='Генерация...',o.style.opacity='0',a.classList.remove('hidden'),toggleImageInfo(!1),d.removeAttribute('href');const r=performance.now();try{const e=await translateText(t),s=generateRandomSeed(),l={inputs:e,parameters:{seed:s,height:roundTo32(parseInt(document.getElementById('height').value)),width:roundTo32(parseInt(document.getElementById('width').value))}},c=parseInt(document.getElementById('num_inference_steps').value);c>0&&(l.parameters.num_inference_steps=c);const m=await query(l),u=URL.createObjectURL(m);o.onload=()=>{o.classList.add('fade-in'),o.style.opacity='',a.classList.add('hidden'),d.href=u,i.innerHTML=`
                <div class="settings-grid">
                    <div class="setting-item">
                        <div class="setting-label">промпт</div>
                        <div class="setting-value">${t}</div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">Переведенный промпт</div>
                        <div class="setting-value">${e}</div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">Размер</div>
                        <div class="setting-value">${l.parameters.width}x${l.parameters.height}</div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">Inference Steps</div>
                        <div class="setting-value">${c>0?c:'Auto'}</div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">Seed</div>
                        <div class="setting-value">${l.parameters.seed}</div>
                    </div>
                    <div class="setting-item">
                        <div class="setting-label">Модель</div>
                        <div class="setting-value">${selectedModel}</div>
                    </div>
                </div>
            `;const n=performance.now(),s=((n-r)/1e3).toFixed(2);document.getElementById('generation-time').textContent=`Время генерации: ${s} секунд`,toggleImageInfo(!0)},o.src=u}catch(e){alert('Error: '+e.message),o.style.opacity='1',a.classList.add('hidden'),toggleImageInfo(!1)}finally{n.disabled=!1,n.textContent='Сгенерировать'}};document.getElementById('generation-form').addEventListener('submit',generateImage);const showPopup=()=>{const e=document.getElementById('api-key-popup');e.classList.remove('hidden','hide'),e.classList.add('show')},hidePopup=()=>{const e=document.getElementById('api-key-popup');e.classList.add('hide'),e.addEventListener('animationend',function(){e.classList.add('hidden'),e.classList.remove('show','hide')},{once:!0})};document.getElementById('api-key-btn').addEventListener('click',()=>{apiKey=localStorage.getItem('apiKey')||'',document.getElementById('api-key-input').value=apiKey,showPopup()}),document.getElementById('save-api-key').addEventListener('click',()=>{apiKey=document.getElementById('api-key-input').value.trim(),localStorage.setItem('apiKey',apiKey),hidePopup()}),document.getElementById('api-key-popup').addEventListener('click',e=>{'api-key-popup'===e.target.id&&hidePopup()});
