let products = [];
let produtoSendoExcluido = {};
document.addEventListener("DOMContentLoaded", () => {
    initPage();
    search();
});

function filtrarPorCategoria(category, element) {
    // 1. Atualiza o visual dos botões
    // Remove a classe 'active' de todos os botões do grupo
    const botoes = document.querySelectorAll('#filtro-categorias .btn');
    botoes.forEach(btn => btn.classList.remove('active'));

    // Adiciona a classe 'active' apenas no botão que foi clicado
    element.classList.add('active');

    // Limpa a barra de pesquisa para não haver conflito visual de filtros
    document.getElementById('input-busca').value = "";

    // 2. Filtra os produtos
    let produtosFiltrados = [];
    const containerProdutos = document.getElementById("vitrine-produtos");

    if (category === 'todos') {
        produtosFiltrados = products;
    } else if (category === 'clothing') {
        // Agrupa "men's clothing" e "women's clothing" procurando pela palavra "clothing"
        produtosFiltrados = products.filter(p => p.category.includes('clothing'));
    } else {
        // Filtro exato para electronics e jewelery
        produtosFiltrados = products.filter(p => p.category === category);
    }

    // 3. Atualiza a tela
    if (produtosFiltrados.length === 0) {
        containerProdutos.innerHTML = `
            <div class="alert alert-info w-100 text-center shadow-sm">
                Nenhum produto cadastrado nesta categoria.
            </div>
        `;
    } else {
        _renderProducts(produtosFiltrados, containerProdutos);
    }
}

function search() {
    const inputSearch = document.getElementById("input-busca");
    const containerProdutos = document.getElementById("vitrine-produtos");

    inputSearch.addEventListener("input", ($e) => {
        // Pega o texto digitado, remove espaços em branco extras e converte para minúsculo
        const termoBusca = $e.target.value.toLowerCase().trim();
        console.log(termoBusca);
        // Se o input estiver vazio, mostra todos os produtos originais
        if (termoBusca === "") {
            _renderProducts(products, containerProdutos);
            return;
        }
        // Filtra a lista global buscando o termo no título ou na categoria
        const produtosFiltrados = products.filter(produto => {
            const titulo = produto.title.toLowerCase();
            const categoria = produto.category.toLowerCase();

            return titulo.includes(termoBusca) || categoria.includes(termoBusca);
        });

        // Atualiza a tela com o resultado
        if (produtosFiltrados.length === 0) {
            containerProdutos.innerHTML = `
                <div class="alert alert-warning w-100 text-center shadow-sm">
                    <i class="bi bi-search me-2"></i>Nenhum produto encontrado para "<strong>${termoBusca}</strong>".
                </div>
            `;
        } else {
            _renderProducts(produtosFiltrados, containerProdutos);
        }
    });
}

async function initPage() {

    const containerProdutos = document.getElementById("vitrine-produtos");

    products = await getProducts();
    if (products.length === 0) {
        _renderNoProducts(containerProdutos);
        return;
    }
    _renderProducts(products, containerProdutos);
}

function _renderNoProducts(id) {
    id.innerHTML = `<div class="alert alert-info w-100 text-center">Nenhum produto cadastrado no banco de dados.</div>`;
}

function syncStockGlobal() {
    const btnSync = document.getElementById("btn-refresh");
    const content = btnSync.innerHTML;

    // Feedback visual: desabilita o botão e mostra o spinner
    btnSync.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Sincronizando...`;
    btnSync.disabled = true;

    syncGlobalStorage()
        .then(products => {
            _renderProducts(products, document.getElementById("vitrine-produtos"));
            showToast("Estoque sincronizado com sucesso!");
            btnSync.innerHTML = content;
            btnSync.disabled = false;
        })
        .catch(error => {
            console.error("Erro ao sincronizar estoque:", error);
            btnSync.innerHTML = content;
            btnSync.disabled = false;
        });
}

/**
 * Busca a lista completa de produtos da API.
 *
 * @param {Product[]} products Lista de produtos buscados na API.
 * @param {HTMLElement} container Elemento HTML onde os produtos serão renderizados.
 * @throws {Error} Lança um erro se a requisição falhar.
 */
function _renderProducts(products, container) {
    container.innerHTML = '';
    products.forEach(prod => {
        const snippetCardText = _createNewCardProduct(prod);
        container.innerHTML += snippetCardText;
    });
}

async function _editProduct(id) {
    _clearEditForm();
    // Reseta todos os campos do formulário para o estado vazio/padrão
    document.getElementById('formEditarProduto').reset();

    // Reseta a imagem para um estado vazio (opcional)
    document.getElementById('edit-img-preview').src = "";
    const produtoSendoEditado = products.find(prod => prod.id === id);
    // Preenche o id do produto no input hidden
    document.getElementById('edit-id').value = produtoSendoEditado.id;
    // Preenche o cabeçalho e a imagem
    document.getElementById('modal-titulo-nome').innerText = produtoSendoEditado.title;
    document.getElementById('edit-img-preview').src = produtoSendoEditado.image;

    // Preenche campos de texto
    document.getElementById('edit-nome').value = produtoSendoEditado.title;
    document.getElementById('edit-preco').value = produtoSendoEditado.price;
    document.getElementById('edit-preco-promo').placeholder = produtoSendoEditado.price;
    document.getElementById('edit-desc').value = produtoSendoEditado.description;
    document.getElementById('edit-rating-rate').value = produtoSendoEditado.rating.rate;
    document.getElementById('edit-rating-count').value = produtoSendoEditado.rating.count;

    // Marca o radio button da categoria correta
    const radios = document.getElementsByName('edit-categoria');
    for (let radio of radios) {
        if (radio.value === produtoSendoEditado.category) {
            radio.checked = true;
            break;
        }
    }
}

async function saveEdit() {
    const product = {
        id: document.getElementById('edit-id').value,
        title: document.getElementById('edit-nome').value,
        price: document.getElementById('edit-preco-promo').value,
        description: document.getElementById('edit-desc').value,
        category: document.querySelector('input[name="edit-categoria"]:checked').value,
        image: document.getElementById('edit-img-preview').src,
        stock: document.getElementById('edit-estoque').value,
        rating: {
            rate: document.getElementById('edit-rating-rate').value,
            count: document.getElementById('edit-rating-count').value
        }
    }

    updateProduct(product.id, product)
        .then(v => {
            const modelEl = document.getElementById('modalEditarProduto');
            const modalInstance = bootstrap.Modal.getInstance(modelEl);
            modalInstance.hide();
            _clearEditForm();
            showToast("Produto atualizado com sucesso!");
            return v;
        })
        .catch(err => {
            throw err;
        });
    await initPage();
}


async function _deleteProduct(id) {
    produtoSendoExcluido = products.find(prod => prod.id === id);
    if (!produtoSendoExcluido) return;
    // Preenche o mini-card dentro do modal com os dados do produto
    document.getElementById('del-img-preview').src = produtoSendoExcluido.image;
    document.getElementById('del-nome').innerText = produtoSendoExcluido.title;
    document.getElementById('del-preco').innerText = `R$ ${produtoSendoExcluido.price.toFixed(2)}`;

    // Abre o modal de exclusão usando a instância do Bootstrap
    const modal = new bootstrap.Modal(document.getElementById('modalExcluirProduto'));
    modal.show();
}

async function showToast(mensagem) {
    // Altera o texto da mensagem dinamicamente
    document.getElementById('toast-mensagem').innerText = mensagem;

    // Instancia o toast e manda exibi-lo
    const toastEl = document.getElementById('toastSucesso');
    const toast = new bootstrap.Toast(toastEl, {
        delay: 3000 // O toast sumirá sozinho após 3 segundos
    });

    toast.show();
}

async function confirmarExclusao() {
    if (!produtoSendoExcluido) return;

    const btnConfirmar = document.querySelector("#modalExcluirProduto .btn-danger");
    const textoOriginal = btnConfirmar.innerHTML;
    btnConfirmar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Apagando...`;
    btnConfirmar.disabled = true;

    deleteProduct(produtoSendoExcluido.id)
        .then(() => {
            const modalEl = document.getElementById('modalExcluirProduto');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();
            return;
        });
    // Recarrega a vitrine instantaneamente
    await initPage();
    showToast("Produto removido permanentemente do estoque.");
}

function _clearEditForm() {
    // Reseta todos os campos do formulário para o estado vazio/padrão
    document.getElementById('formEditarProduto').reset();
    // Reseta a imagem para um estado vazio (opcional)
    document.getElementById('edit-img-preview').src = "";
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-nome').value = '';
    document.getElementById('edit-preco-promo').placeholder = '';
    document.getElementById('edit-desc').value = '';
    document.getElementById('edit-rating-rate').value = '';
    document.getElementById('edit-rating-count').value = '';
}

function _createNewCardProduct(product) {
    const stock  = product.stock;

    // Variáveis padrão (Estoque normal: >= 10)
    let corBordaCard = "border-0";
    let classeBadgeEstoque = "bg-light text-dark border";
    let iconeEstoque = "bi-box-seam";
    let opacidadeImagem = "1";

    // Lógica de alerta de estoque
    if (stock === 0) {
        // Sem estoque (Vermelho)
        corBordaCard = "border-danger border-2"; // Borda vermelha mais grossa
        classeBadgeEstoque = "text-bg-danger";
        iconeEstoque = "bi-x-circle";
        opacidadeImagem = "0.4"; // Deixa a foto do produto "apagada"
    } else if (stock < 10) {
        // Estoque Baixo (Amarelo)
        corBordaCard = "border-warning border-2"; // Borda amarela
        classeBadgeEstoque = "text-bg-warning text-dark";
        iconeEstoque = "bi-exclamation-triangle";
    }

    return `
                <div class="col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm ${corBordaCard}">
                        <img src="${product.image}" class="card-img-top p-3" alt="${product.title}" style="height: 200px; width: auto; object-fit: contain; opacity: ${opacidadeImagem}; transition: 0.3s;">
                        <div class="card-body d-flex flex-column">
                            <!-- Novo Contentor: Categoria à esquerda e Stock à direita -->
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <!-- Etiqueta de categoria com limite de largura e reticências automáticas -->
                                <span class="badge text-bg-secondary text-truncate pr-2" style="max-width: 60%;" title="${product.category}">
                                    ${product.category}
                                </span>
                                
                                <!-- Badge de Estoque Dinâmica -->
                                <span class="badge ${classeBadgeEstoque} flex-shrink-0">
                                    <i class="bi ${iconeEstoque} me-1"></i> Estoque: ${stock}
                                </span>
                            </div>
                            <h6 class="card-title text-truncate" title="${product.title}">${product.title}</h6>
                            <h5 class="card-text text-success fw-bold mb-3">R$ ${product.price.toFixed(2)}</h5>
                            
                            <div class="mt-auto d-grid gap-2">
                                <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalEditarProduto" onclick="_editProduct(${product.id})">
                                    <i class="bi bi-pencil me-1"></i> Editar
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="_deleteProduct(${product.id})">
                                    <i class="bi bi-trash me-1"></i> Remover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}


