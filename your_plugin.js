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

    const listExames = []
    const trCheckBoxes = document.querySelectorAll('tr.trCheckBox');
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

        listExames.push(labelText)

        let matchFound = false;
        dataList.forEach(dataItem => {
            if (labelText && dataItem.name && labelText.trim() === dataItem.name.trim()) {
                // Match perfeito
                inputP.value = dataItem.value.input1 || ''; // Define o valor do primeiro input
                inputC.value = dataItem.value.input2 || ''; // Define o valor do segundo input
                
                labelTd.style.color = 'white';
                labelTd.style.fontSize = "150%"
                labelTd.style.fontWeight="bold";
                labelTd.style.background = 'black'; // Muda background da label para preto
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
 
    const exames_not_found = dataList.filter( x => !listExames.includes(x.item) );

    console.log({
        exames_nao_encontrado: exames_not_found
    })
    return exames_not_found;
}