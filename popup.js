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
    const textCopy = document.getElementById('textCopy');

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
            // addInputFieldGroup(); // Adiciona um grupo vazio se não houver API de armazenamento
        }
    } catch (error) {
        console.error(error)
    }

    function addInputFieldGroup(label = '2,5 HEXANODIONA', input1 = '100', input2 = '100') {
        /*
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
        */

        textCopy.value = textCopy.value + "\n label R$ " +input1;

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

    function removeNumberFromFullText(myString){

        // Regex Explicada:
        // ^            : Início da string
        // (\d+)        : Captura um ou mais dígitos (a parte inteira do número)
        // (?:[.,]\d+)? : Grupo não capturador (?:...) que significa:
        //                [.,]    : Um ponto OU uma vírgula
        //                \d+     : Seguido por um ou mais dígitos (a parte decimal)
        //                ?       : Todo o grupo decimal é opcional (para inteiros)
        // \s* : Zero ou mais espaços (entre o número e o texto)
        // (.*)         : Captura o restante da string (o texto)
        const regex = /^(\d+(?:[.,]\d+)?)\s*(.*)$/;
        const match = myString.match(regex);

        let numberPart;
        let textPart;

        if (match) {
            numberPart = match[1]; // The first captured group is the number string
            textPart = match[2].trim();         // The second captured group is the rest of the text
        } else {
            // Handle cases where the string doesn't match the expected format
            console.log(`String format not recognized. ( ${myString} )`);
            numberPart = null;
            textPart = myString; // Or set to an empty string, depending on desired behavior
        }
        return { number: numberPart, text: textPart}
    }

    function isNumber(str) {
        if (typeof str !== 'string' || str.trim() === '') {
            return false; // Não é string ou está vazia
        }

        // Regex explicada:
        // ^          : Início da string. Garante que a regex verifica a string do começo.
        // [-+]?      : Opcional. Captura um sinal de menos (-) ou mais (+).
        // \d+        : Captura um ou mais dígitos (0-9).
        // (?:[.,]\d+)? : Opcional. Grupo não-capturante (?:...) para a parte decimal.
        //                [.,]  : Captura um ponto (.) OU uma vírgula (,).
        //                \d+   : Seguido por um ou mais dígitos.
        // $          : Fim da string. Garante que a regex verifica a string até o final.
        const regex = /^[-+]?\d+(?:[.,]\d+)?$/;

        return regex.test(str);
    }

    function getDataFromTextOneLine(text){
        const listNotProcess = text.split("R$")
        let currentListValues = [];
        let indexCurrentValues = 0;

        for (let idx = 0; idx < listNotProcess.length; idx++) {
            const element = listNotProcess[idx].trim();

            if(idx == 0){
                currentListValues.push( [element] );
                continue;
            }

            if( isNumber(element) ){
                currentListValues[indexCurrentValues].push(element);
            }else{
                let valores = removeNumberFromFullText(element)
                currentListValues[indexCurrentValues++].push(valores.number);
                currentListValues.push( [valores.text] );
            }
        }

        return currentListValues;
    }

    // Adiciona listener para o botão "Aplicar Valores"
    applyButton.addEventListener('click', () => {
        const dataList = [];
        const inputGroups = document.querySelectorAll('.input-group');
        
        if( textCopy.value ){
            const resultList = textCopy.value.split(/\r?\n|\r/).length > 1 ? 
            textCopy.value.split(/\r?\n|\r/).map( x => x.split("R$").map( x => x.trim() ) ) :
            getDataFromTextOneLine(textCopy.value);

            /*
            textCopy.value.split(/\r?\n|\r/).map( x => x.split("R$").map( x => x.trim() ) )
            .forEach(group => { 
                if(group[0]){
                    dataList.push({
                        name: group[0],
                        value: {
                            input1: group[1],
                            input2: group[1]
                        }
                    });
                }
             });
            */

            resultList.forEach(group => { 
                if(group[0]){
                    dataList.push({
                        name: group[0],
                        value: {
                            input1: group[1],
                            input2: group[1]
                        }
                    });
                }
            });

        }else{
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
        }
        
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
                    console.log({ responseStr: response.message.map( x => x.name ).join(", ") })
                    displayMessage(`Exames não encontrados: ` + response.message.map( x => x.name ).join(", "), 'warning');
                } else if (response && response.status === "error") {
                    displayMessage('Erro ao aplicar valores na página: ' + response.message, 'error');
                } else {
                    displayMessage('Tentando aplicar valores... verifique o console para detalhes.', 'warning');
                }
            });
        });
        // --- FIM DAS MUDANÇAS ---

    });

    function displayMessage(msg, type) {
        messageDiv.textContent = msg;
        messageDiv.className = '';
        messageDiv.classList.add('message-' + type);
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = '';
        }, 5000); // Limpa a mensagem após 5 segundos
    }

    // Função para salvar os dados no chrome.storage.sync
    function saveDataToStorage(dataToSave = null) {

        if (!storageAPI) {
            // console.warn("Dados não salvos: API de armazenamento não disponível.");
            return;
        }

        const currentDataList = [];

        /*
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
        */

        storageAPI.set({ savedDataList: dataToSave || currentDataList });
    }

    // Adiciona event listeners para salvar dados ao digitar (opcional, mas útil)
    inputContainer.addEventListener('input', saveDataToStorage);
});