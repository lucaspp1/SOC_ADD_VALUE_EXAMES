// your_plugin.js
/**
 * Plugin para atualizar valores de inputs e destacar labels em linhas de tabela específicas.
 *
 * @param {Array<Object>} dataList - Um array de objetos, onde cada objeto tem propriedades 'name' e 'value'.
 * Exemplo: [{ name: "2,5 HEXANODIONA", value: { input1: "100,00", input2: "200,00" } }]
 */
function processTableRows(dataList) {
    if (!dataList || !Array.isArray(dataList)) {
        console.error("processTableRows: A lista de dados fornecida é inválida.");
        return;
    }

    console.log({
        iframe: document.getElementById("socframe")
    });

    const trCheckBoxes = document.querySelectorAll('tr.trCheckBox');

    console.log({trCheckBoxes: trCheckBoxes})

    trCheckBoxes.forEach(tr => {
        const labelTd = tr.querySelector('td.label');
        if (!labelTd) {
            console.warn("processTableRows: Não foi encontrada uma <td> com a classe 'label' nesta tr.", tr);
            return;
        }

        const labelText = labelTd.textContent.trim();
        const inputP = tr.querySelector('input[name^="p#-#"]'); // Input para o primeiro valor
        const inputC = tr.querySelector('input[name^="c#-#"]'); // Input para o segundo valor

        if (!inputP || !inputC) {
            console.warn("processTableRows: Não foram encontrados os inputs 'p#-#' ou 'c#-#' nesta tr.", tr);
            return;
        }

        let matchFound = false;
        dataList.forEach(dataItem => {
            if (labelText === dataItem.name) {
                // Match perfeito
                inputP.value = dataItem.value.input1 || ''; // Define o valor do primeiro input
                inputC.value = dataItem.value.input2 || ''; // Define o valor do segundo input
                labelTd.style.color = 'green'; // Muda a cor da label para verde
                matchFound = true;
                return; // Sai do loop interno uma vez que uma correspondência é encontrada
            }
        });

        // Se nenhuma correspondência perfeita for encontrada, a label permanece com a cor original.
        // Se você quiser resetar a cor ou aplicar outra cor para não-matches, adicione lógica aqui:
        // if (!matchFound) {
        //     labelTd.style.color = ''; // Reseta para a cor padrão do CSS
        // }
    });
}