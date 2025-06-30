// content_script.js
// Este arquivo é necessário para o Chrome Manifest V3 para definir um contexto
// onde scripts podem ser injetados.
// No nosso caso, o 'your_plugin.js' é injetado e executado diretamente pelo popup.js
// através de 'chrome.scripting.executeScript'.
// Portanto, este arquivo pode permanecer vazio ou conter apenas logging para debug.
console.log("Content script loaded.");