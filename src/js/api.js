/**
 * Definição de um objeto de avaliação (Rating)
 * @typedef {Object} Rating
 * @property {number} rate - A nota média do produto
 * @property {number} count - A quantidade de avaliações
 */

/**
 * Definição de um objeto Produto
 * @typedef {Object} Product
 * @property {number} id - O identificador único do produto
 * @property {string} title - O título ou nome do produto
 * @property {number} price - O preço do produto
 * @property {string} description - A descrição detalhada do produto
 * @property {string} category - A categoria do produto
 * @property {string} image - A URL da imagem do produto
 * @property {Rating} rating - O objeto de avaliação do produto
 */

const URL_API = "http://localhost:8000/products/";

/**
 * Função genérica para tratar as respostas do fetch e capturar erros HTTP.
 * 
 * @param {Response} response - O objeto de resposta do fetch.
 * @returns {Promise<any>} O corpo da resposta convertido para JSON.
 * @throws {Error} Lança um erro se o status da resposta não for bem-sucedido (2xx).
 */
async function handleResponse(response) {
    if (!response.ok) {
        // Se o status não for 2xx, lança um erro com os detalhes
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP! Status: ${response.status}`);
    }
    return response.json();
}

/**
 * Busca a lista completa de produtos da API.
 * 
 * @returns {Promise<Product[]>} Uma promessa que resolve em um array de produtos.
 * @throws {Error} Lança um erro se a requisição falhar.
 */
async function getProducts() {
    try {
        const response = await fetch(URL_API, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        throw error;
    }
}

/**
 * Busca um produto específico pelo seu ID.
 * 
 * @param {number|string} id - O identificador do produto a ser buscado.
 * @returns {Promise<Product>} Uma promessa que resolve no objeto do produto.
 * @throws {Error} Lança um erro se o produto não for encontrado ou a requisição falhar.
 */
async function getProductById(id) {
    try {
        const response = await fetch(`${URL_API}${id}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Erro ao buscar produto por ID:", error);
        throw error;
    }
}

/**
 * Adiciona um novo produto à API.
 * 
 * @param {Omit<Product, 'id'>} product - O objeto do produto a ser adicionado (geralmente sem o ID).
 * @returns {Promise<Product>} Uma promessa que resolve no objeto do produto criado (incluindo o ID).
 * @throws {Error} Lança um erro se a requisição falhar.
 */
async function addProduct(product) {
    try {
        const response = await fetch(URL_API, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Erro ao adicionar produto:", error);
        throw error;
    }
}

/**
 * Atualiza um produto existente na API.
 * 
 * @param {number|string} idProduct - O identificador do produto a ser atualizado.
 * @param {Partial<Product>} product - O objeto com os campos a serem atualizados.
 * @returns {Promise<Product>} Uma promessa que resolve no objeto do produto atualizado.
 * @throws {Error} Lança um erro se a requisição falhar.
 */
async function updateProduct(idProduct, product) {
    try {
        const response = await fetch(`${URL_API}${idProduct}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        throw error;
    }
}

/**
 * Remove um produto da API pelo seu ID.
 * 
 * @param {number|string} idProduct - O identificador do produto a ser removido.
 * @returns {Promise<void>} Uma promessa que resolve quando o produto é removido.
 * @throws {Error} Lança um erro se a requisição falhar.
 */
async function deleteProduct(idProduct) {
    try {
        const response = await fetch(`${URL_API}${idProduct}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("Erro ao remover produto:", error);
        throw error;
    }
}