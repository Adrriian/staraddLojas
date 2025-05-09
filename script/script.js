// Script atualizado com base no HTML e JS fornecidos
let menu = document.querySelector(".menu_mobile_bar")
menu.addEventListener("click", () => {
    let content = document.querySelector("main")
    let menu_m = document.querySelector(".menu_area")

    if (menu_m.style.height == "100vh") {
        menu_m.style.height = "6vh"
        content.classList.remove('hidden')
    } else {
        menu_m.style.height = "100vh"
        content.classList.toggle('hidden')
    }
})

const API_URL = 'https://sheetdb.io/api/v1/zurdkl1c4o21d';
const areaContainer = document.querySelector(".area");
const modal = document.querySelector(".modalc");
let estabelecimentos = [];

async function fetchParceiros() {
    try {
        const response = await fetch(API_URL);
        estabelecimentos = await response.json();
        renderParceiros(estabelecimentos);

        // Adiciona cidades automaticamente ao filtro após renderizar os parceiros
        const containerCidades = document.querySelector('.filtro_cidade_area');
        const cidadesExistentes = Array.from(containerCidades.querySelectorAll("input[name='cidade']"))
            .map(input => input.value.trim().toLowerCase());

       const cidadesUnicas = [...new Set(
    estabelecimentos
        .map(item => item.cidade && item.cidade.trim())
        .filter(cidade => cidade) // remove null, undefined ou string vazia
)];


        cidadesUnicas.forEach(cidade => {
            const cidadeNormalizada = cidade.toLowerCase();
            if (!cidadesExistentes.includes(cidadeNormalizada)) {
                const cidadeId = cidade
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, '').toLowerCase();

                const div = document.createElement('div');
                div.className = 'filtro_cidade';

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'cidade';
                input.id = cidadeId;
                input.value = cidade;

                const label = document.createElement('label');
                label.htmlFor = cidadeId;
                label.textContent = cidade;

                div.appendChild(input);
                div.appendChild(label);
                containerCidades.appendChild(div);
            }
        });

    } catch (error) {
        console.error("Erro ao buscar dados da planilha:", error);
    }
}


function renderParceiros(data) {
    if (!areaContainer) return;
    areaContainer.innerHTML = "";
    data.forEach(parceiro => {
        // Verifica se todos os campos obrigatórios (exceto instagram) estão preenchidos
        const camposObrigatorios = [
            parceiro.nome,
            parceiro.tipo,
            parceiro.cidade,
            parceiro.codigo,
            parceiro.imagem,
            parceiro.alt
        ];

        const dadosCompletos = camposObrigatorios.every(valor => valor && valor.trim() !== "");
        if (!dadosCompletos) return; // Ignora se algum campo obrigatório estiver vazio

        const card = document.createElement("div");
        card.className = "area_conteudo sm";
        card.setAttribute("data-info", encodeURIComponent(JSON.stringify(parceiro)));
        card.setAttribute("data-cidade", parceiro.cidade);
        card.setAttribute("data-tipo", parceiro.tipo);

        card.innerHTML = `
            <div class="area_img">
                <img src="${formatImage(parceiro.imagem)}" alt="${parceiro.alt}">
            </div>
            <div class="area_text">
                <h1 class="p">Nome: ${parceiro.nome}</h1>
                <h1 class="tiponame">Tipo: ${parceiro.tipo}</h1>
                <h1 class="cidadename">Cidade: ${parceiro.cidade}</h1>
                <h1 class="codigo">Codigo: ${parceiro.codigo}</h1>
            </div>
        `;

        card.addEventListener("click", () => abrirModal(parceiro));
        areaContainer.appendChild(card);
    });
}


function abrirModal(p) {
    document.querySelector(".img_troca").src = formatImage(p.imagem);
    document.querySelector(".img_troca").alt = p.alt;
    document.querySelector(".name").textContent = p.nome;
    document.querySelector(".rua").textContent = p.endereco;
    document.querySelector(".num").textContent = p.numero;
    document.querySelector(".bairro").textContent = p.bairro;
    document.querySelector(".phones").textContent = p.telefone;

    // Links
    const insta = document.querySelector(".links");
    const whats = document.querySelector(".links2");
    const btnContato = document.querySelector(".btnw");

    insta.href = p.instagram || "#";
    insta.style.display = p.instagram ? "inline-block" : "none";

    const numeroWhats = (p.whats || "").replace(/\D/g, ""); // remove tudo que não for número
    whats.href = "https://wa.me/" + numeroWhats;
    btnContato.href = "https://wa.me/" + numeroWhats;

    // Descontos
    const produtos = document.querySelector(".produtos");
    produtos.innerHTML = "";

    const descontos = (p.desconto || "").split(";");
    descontos.forEach(desc => {
        const li = document.createElement("li");
        li.textContent = desc.trim();
        produtos.appendChild(li);
    });

    modal.style.display = "flex";
}


document.querySelector(".fechar_modal").addEventListener("click", () => {
    modal.style.display = "none";
});

function aplicarFiltro() {

    const cidadeSelecionada = document.querySelector('input[name="cidade"]:checked');
    const tipoSelecionado = document.querySelector('input[name="estabelecimento"]:checked');

    const cidade = cidadeSelecionada ? cidadeSelecionada.value.toLowerCase() : null;
    const tipo = tipoSelecionado ? tipoSelecionado.value.toLowerCase() : null;

    const cards = document.querySelectorAll(".area_conteudo");
    let encontrados = 0;

    cards.forEach(card => {
        const cardCidade = card.getAttribute("data-cidade").toLowerCase();
        const cardTipo = card.getAttribute("data-tipo").toLowerCase();

        const cidadeMatch = cidade ? cidade === cardCidade : true;
        const tipoMatch = tipo ? tipo === cardTipo : true;

        if (cidadeMatch && tipoMatch) {
            card.style.display = "grid";
            encontrados++;
        } else {
            card.style.display = "none";
        }
    });

    if (encontrados === 0) {
        areaContainer.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    }
}

function removerFiltro() {
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
    renderParceiros(estabelecimentos);
}

function btnn(acao) {
    if (acao === "Filtrar") {
        document.querySelector(".modalf").style.display = "none"
        aplicarFiltro();
    } else if (acao === "removefiltro") {
        removerFiltro();
    } else if (acao === "CIDADE") {
        document.querySelector(".modalf").style.display = "flex";
    }
}

function formatImage(url) {
    if (!url) return "";
    return url.startsWith("http") ? url : `https://${url}`;
}

fetchParceiros();
