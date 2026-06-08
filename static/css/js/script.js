let grafico;
let salarioBase = 0;

// Carrega os dados assim que a página abre
document.addEventListener("DOMContentLoaded", () => {
    // Configura o input de salário para atualizar o saldo dinamicamente enquanto você digita
    const inputSalario = document.getElementById('salario-inicial');
    if (inputSalario) {
        inputSalario.addEventListener('input', () => {
            salarioBase = parseFloat(inputSalario.value) || 0;
            atualizarSaldo(); // Recalcula o saldo na tela imediatamente
        });
    }
    carregarDados();
});

async function carregarDados(){
    await atualizarLista();
    await atualizarSaldo();
}

// FORMATADOR DE MOEDA (Coloca pontos e vírgulas automaticamente no padrão R$ 1.500,00)
const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

async function adicionarTransacao(){
    const descricao = document.getElementById("descricao").value.trim();
    const valor = parseFloat(document.getElementById("valor").value);
    const categoria = document.getElementById("categoria").value.trim();
    const tipo = document.getElementById("tipo").value;

    if(!descricao || !valor || !categoria){
        alert("Preencha todos os campos.");
        return;
    }

    // Envia a nova transação para o banco de dados
    await fetch("/api/transacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao, valor, categoria, tipo })
    });

    // Limpa os inputs do formulário
    document.getElementById("descricao").value = "";
    document.getElementById("valor").value = "";
    document.getElementById("categoria").value = "";

    // Atualiza a tela inteira
    carregarDados();
}

async function atualizarLista(){
    const resposta = await fetch("/api/transacoes");
    const dados = await resposta.json();

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    let categorias = {};

    // Renderiza a lista de trás para frente (mais recente primeiro)
    dados.reverse().forEach(item => {
        // Agrupa as despesas para o gráfico
        if(item.tipo === "despesa"){
            categorias[item.categoria] = (categorias[item.categoria] || 0) + Number(item.valor);
        }

        // Define o sinal (+ ou -) e a cor baseado no tipo
        const sinal = item.tipo === "receita" ? "+" : "-";
        const classeCor = item.tipo === "receita" ? "color-green" : "";

        // Formata apenas o número da transação sem o "R$" duplicado na direita
        const valorFormatado = formatadorMoeda.format(Number(item.valor)).replace("R$", "").trim();

        lista.innerHTML += `
        <div class="transacao">
            <div>
                <strong>${item.descricao}</strong>
                <p style="font-size: 12px; color: #626278; margin-top: 4px;">${item.categoria}</p>
            </div>
            <div class="${classeCor}" style="font-weight: 600;">
                ${sinal} ${valorFormatado}
            </div>
        </div>
        `;
    });

    atualizarGrafico(categorias);
}

async function atualizarSaldo(){
    const resposta = await fetch("/api/saldo");
    const dados = await resposta.json();
    
    // Pegamos o saldo que veio do banco de dados (que já calcula receitas e despesas)
    // e somamos ao Salário Base inserido na tela pelo usuário
    let saldoFinal = salarioBase + Number(dados.saldo);

    // Renderiza na tela com vírgula e ponto corretos
    document.getElementById("saldo").innerText = formatadorMoeda.format(saldoFinal);
}

function atualizarGrafico(categorias){
    const labels = Object.keys(categorias);
    const valores = Object.values(categorias);
    const ctx = document.getElementById("grafico");

    if(!ctx) return;

    if(grafico){
        grafico.destroy();
    }

    // Se não tiver despesas ainda, evita que o gráfico suma ou dê erro
    if(labels.length === 0) {
        labels.push("Sem gastos");
        valores.push(1);
    }

    // Criando o gráfico estilo "doughnut" (rosca) combinando com a UI do app Dormy/Advocacia
    grafico = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: [
                    '#c084fc', '#bbf7d0', '#38bdf8', '#f43f5e', '#fb923c'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false } // Esconde legendas de bloco padrão para ficar clean
            },
            cutout: '75%' // Deixa o centro vazado e elegante
        }
    });
}