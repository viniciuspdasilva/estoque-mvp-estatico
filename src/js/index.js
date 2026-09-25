let products = [];
document.addEventListener("DOMContentLoaded", () => {
    initPage();
});

async function initPage() {

    const containerProdutos = document.getElementById("vitrine-produtos");

    products = await getProducts();
    if (products.length === 0) {
        _renderNoProducts(containerProdutos);
        return;
    }
    _renderProducts(products, containerProdutos);
    document.getElementById("contador-estoque").innerText = products.length;
    console.log(products);
}

function _renderNoProducts(id) {
    id.innerHTML = `<div class="alert alert-info w-100 text-center">Nenhum produto cadastrado no banco de dados.</div>`;
}

/**
 * Busca a lista completa de produtos da API.
 *
 * @param {Product[]} products Lista de produtos buscados na API.
 * @param {HTMLElement} container Elemento HTML onde os produtos serão renderizados.
 * @throws {Error} Lança um erro se a requisição falhar.
 */
function _renderProducts(products, container) {
    products.forEach(prod => {
        const snippetCardText = _createNewCardProduct(prod);
        container.innerHTML += snippetCardText;
    });
}

async function _editProduct(id) {
    const produtoSendoEditado = products.find(prod => prod.id === id);
    // Preenche o cabeçalho e a imagem
    document.getElementById('modal-titulo-nome').innerText = produtoSendoEditado.title;
    document.getElementById('edit-img-preview').src = produtoSendoEditado.image;

    // Preenche campos de texto
    document.getElementById('edit-nome').value = produtoSendoEditado.title;
    document.getElementById('edit-preco').value = produtoSendoEditado.price;
    document.getElementById('edit-desc').value = produtoSendoEditado.description;

    // Marca o radio button da categoria correta
    const radios = document.getElementsByName('edit-categoria');
    for (let radio of radios) {
        if (radio.value === produtoSendoEditado.category) {
            radio.checked = true;
            break;
        }
    }
}

function saveEdit(product) {

}

function _createNewCardProduct(product) {
    return `
                <div class="col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="${product.image}" class="card-img-top p-3" alt="${product.title}" style="height: 200px; object-fit: contain;">
                        <div class="card-body d-flex flex-column">
                            <span class="badge text-bg-secondary mb-2 align-self-start">${product.category}</span>
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
