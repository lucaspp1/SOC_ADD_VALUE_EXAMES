// content_script.js

// Verifica se este script está rodando dentro do iframe alvo
// 'window.frameElement' existe se o script estiver em um iframe.
// 'window.name' ou 'window.frameElement.id' podem ser usados para identificar o iframe.
const IFRAME_ID_OR_NAME = 'socframe';

// Condição para garantir que o script só age no iframe correto
// e não no frame principal ou em outros iframes
if (window.frameElement && (window.frameElement.id === IFRAME_ID_OR_NAME || window.frameElement.name === IFRAME_ID_OR_NAME)) {
    console.log(`Content script ativo dentro do iframe: ${IFRAME_ID_OR_NAME}`);

    // Função para injetar o script your_plugin.js no contexto da página do iframe.
    function injectScript(file_path, tag) {
        const node = document.getElementsByTagName(tag)[0];
        if (node) { // Verifica se o elemento existe antes de tentar anexar
            const script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', chrome.runtime.getURL(file_path));
            // Adicione um id ao script para evitar injeções múltiplas
            script.setAttribute('id', 'soc_value_adder_plugin_script');
            // Verifica se o script já foi injetado
            if (!document.getElementById('soc_value_adder_plugin_script')) {
                node.appendChild(script);
                console.log(`your_plugin.js injetado no iframe ${IFRAME_ID_OR_NAME}.`);
            }
        } else {
            console.warn(`Tag '${tag}' não encontrada para injetar your_plugin.js no iframe.`);
        }
    }

    // Injeta o your_plugin.js assim que o content_script carrega NO IFRAME
    injectScript('your_plugin.js', 'body');

    // Listener para mensagens vindas do popup.js
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            // Verifica se a mensagem veio do popup (tabId para o frame principal)
            // ou se é uma mensagem direcionada para este iframe específico.
            // Para Manifest V3, 'sender.frameId' é mais confiável para identificar o iframe remetente
            // mas aqui estamos recebendo no iframe e esperando que a mensagem seja para este iframe.
            if (request.type === "APPLY_DATA") {
                try {
                    // Chama a função global processTableRows que foi injetada no contexto do iframe
                    if (typeof window.processTableRows === 'function') {
                        window.processTableRows(request.data);
                        sendResponse({ status: "success", message: "Dados aplicados." });
                    } else {
                        console.error("Erro: A função processTableRows não está definida no contexto do iframe.");
                        sendResponse({ status: "error", message: "Função 'processTableRows' não encontrada no iframe." });
                    }
                } catch (e) {
                    console.error("Erro ao executar processTableRows no iframe:", e);
                    sendResponse({ status: "error", message: "Erro de execução no iframe: " + e.message });
                }
                return true; // Indica que a resposta será enviada assincronamente
            }
        }
    );

} else {
    // Este script está rodando no frame principal ou em outro iframe não alvo.
    // Ele pode servir como um "repassador" de mensagens ou apenas ignorar.
    // Para simplificar, vamos apenas logar e não fazer nada.
    // Se o popup precisar enviar uma mensagem para um iframe específico,
    // ele precisaria do frameId do iframe, o que é mais complexo de obter.
    // A abordagem atual (all_frames: true) fará com que todos os content scripts escutem
    // e o iframe correto agirá.
    // console.log("Content script carregado em um frame não-alvo ou principal.");
}