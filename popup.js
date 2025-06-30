// Função auxiliar para determinar a API de armazenamento correta
// prioriza 'browser' (padrão WebExtensions) e fallback para 'chrome'
const storageAPI = (() => {
    if (typeof browser !== 'undefined' && browser.storage) {
        return browser.storage.sync || browser.storage.local; // Tenta sync, fallback para local
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
        return chrome.storage.sync || chrome.storage.local; // Tenta sync, fallback para local
    }
    console.warn("Nenhuma API de armazenamento de extensão encontrada. Os dados não serão salvos.");
    return null; // Nenhuma API de armazenamento disponível
})();

// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const applyButton = document.getElementById('applyButton');
    const addMoreButton = document.getElementById('addMore');
    const inputContainer = document.getElementById('inputContainer');
    const messageDiv = document.getElementById('message');
    try {
        
        // Recupera dados salvos, se existirem
        if (storageAPI) {
            storageAPI.get(['savedDataList'], (result) => {
                if (result.savedDataList && result.savedDataList.length > 0) {
                    result.savedDataList.forEach(item => {
                        addInputFieldGroup(item.name, item.value.input1, item.value.input2);
                    });
                } else {
                    addInputFieldGroup(); // Adiciona um grupo vazio se não houver dados salvos
                }
            });
        } else {
            addInputFieldGroup(); // Adiciona um grupo vazio se não houver API de armazenamento
        }

    } catch (error) {
        console.error(error)
    }


    // Função para adicionar um novo conjunto de campos de input
    function addInputFieldGroup(label = '2,5 HEXANODIONA', input1 = '100', input2 = '100') {
        const div = document.createElement('div');
        div.classList.add('input-group');
        div.innerHTML = `
            <label>Nome da Label:</label>
            <input type="text" class="label-name" placeholder="Ex: 2,5 HEXANODIONA" value="${label}">
            <label>Valor para Input 1 (P):</label>
            <input type="text" class="input1-value" placeholder="Ex: 150,00" value="${input1}">
            <label>Valor para Input 2 (C):</label>
            <input type="text" class="input2-value" placeholder="Ex: 150,00" value="${input2}">
            <button class="remove-group">Remover</button>
        `;
        inputContainer.appendChild(div);

        // Adiciona listener para o botão "Remover"
        div.querySelector('.remove-group').addEventListener('click', () => {
            div.remove();
            saveDataToStorage(); // Salva os dados após remover um grupo
        });
    }

    // Adiciona listener para o botão "Adicionar Mais Campos"
    addMoreButton.addEventListener('click', () => {
        addInputFieldGroup();
    });

    // Adiciona listener para o botão "Aplicar Valores"
    applyButton.addEventListener('click', () => {
        const dataList = [];
        const inputGroups = document.querySelectorAll('.input-group');

        inputGroups.forEach(group => {
            const labelName = group.querySelector('.label-name').value.trim();
            const input1Value = group.querySelector('.input1-value').value.trim();
            const input2Value = group.querySelector('.input2-value').value.trim();

            if (labelName) { // Adiciona apenas se o nome da label for fornecido
                dataList.push({
                    name: labelName,
                    value: {
                        input1: input1Value,
                        input2: input2Value
                    }
                });
            }
        });

        // Salva os dados no storage do Chrome
        saveDataToStorage(dataList);

        if (dataList.length === 0) {
            displayMessage('Por favor, insira os valores para aplicar.', 'warning');
            return;
        }

        // processTableRows(dataList);

        // --- MUDANÇAS AQUI ---
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                displayMessage('Nenhuma aba ativa encontrada.', 'error');
                return;
            }
            const tabId = tabs[0].id;

            // Injeta o 'your_plugin.js' na página através do content_script
            // Usamos chrome.scripting.executeScript aqui para garantir que o content_script.js
            // seja executado primeiro e tenha acesso ao 'window.URL' para injetar o plugin.
            // Para navegadores que não suportam bem, 'content_script.js' já estará injetado
            // e cuidará da carga do 'your_plugin.js'.

            // Enviamo uma mensagem para o content_script com os dados
            // O content_script, por sua vez, carrega e executa o your_plugin.js
            chrome.tabs.sendMessage(tabId, { type: "APPLY_DATA", data: dataList }, (response) => {
                if (chrome.runtime.lastError) {
                    // Isso pode ocorrer se o content_script ainda não foi injetado ou não está respondendo
                    console.error("Erro ao enviar mensagem:", chrome.runtime.lastError);
                    displayMessage('Erro de comunicação com a página. Tente recarregar a página e a extensão.', 'error');
                } else if (response && response.status === "success") {
                    displayMessage('Valores aplicados com sucesso!', 'success');
                } else if (response && response.status === "error") {
                    displayMessage('Erro ao aplicar valores na página: ' + response.message, 'error');
                } else {
                    displayMessage('Tentando aplicar valores... verifique o console para detalhes.', 'warning');
                }
            });
        });
        // --- FIM DAS MUDANÇAS ---

        
    });

    // Função para exibir mensagens na interface do popup
    function displayMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = ''; // Limpa classes anteriores
        messageDiv.classList.add('message-' + type); // Adiciona a classe de tipo
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }, 3000); // Limpa a mensagem após 3 segundos
    }

    // Função para salvar os dados no chrome.storage.sync
    function saveDataToStorage(dataToSave = null) {

        if (!storageAPI) {
            console.warn("Dados não salvos: API de armazenamento não disponível.");
            return;
        }

        const currentDataList = [];
        document.querySelectorAll('.input-group').forEach(group => {
            const labelName = group.querySelector('.label-name').value.trim();
            const input1Value = group.querySelector('.input1-value').value.trim();
            const input2Value = group.querySelector('.input2-value').value.trim();
            if (labelName) {
                currentDataList.push({
                    name: labelName,
                    value: {
                        input1: input1Value,
                        input2: input2Value
                    }
                });
            }
        });

        storageAPI.set({ savedDataList: dataToSave || currentDataList });
    }

    // Adiciona event listeners para salvar dados ao digitar (opcional, mas útil)
    inputContainer.addEventListener('input', saveDataToStorage);
});