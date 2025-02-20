const API_URL = "https://fakestoreapi.com/products";
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartButton() {
  const cartButton = document.querySelector("#cartButton");
  if (!cartButton) return; // Garante que o botão existe antes de tentar atualizar
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartButton.textContent = `Carrinho (${totalItems})`;
}

function addToCart(product, quantity) {
  const existingProduct = cart.find((item) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += quantity; // Incrementa a quantidade
  } else {
    cart.push({ ...product, quantity }); // Adiciona o produto ao carrinho
  }
  localStorage.setItem("cart", JSON.stringify(cart)); // Salva o carrinho atualizado
  updateCartButton(); // Atualiza o contador do carrinho
}

function updateCartSummary() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartItems || !cartTotal) {
    console.error("Elementos do carrinho não encontrados no DOM.");
    return;
  }

  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Seu carrinho está vazio!</p>";
    cartTotal.textContent = "Total: R$ 0,00";
    return;
  }

  cart.forEach((item, index) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.title}" />
      <h3>${item.title}</h3>
      <p>R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
      <button onclick="removeFromCart(${index})">Remover</button>
    `;
    cartItems.appendChild(cartItem);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;
}

function loadProducts() {
  const productsContainer = document.getElementById("productsContainer");
  if (!productsContainer) return; // Garante que estamos na página certa

  fetch(API_URL)
    .then((response) => response.json())
    .then((products) => {
      products.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.className = "product";
        productElement.innerHTML = `
          <img src="${product.image}" alt="${
          product.title
        }" class="product-image" />
          <h3 class="product-title">${product.title}</h3>
          <p class="product-price">R$ ${product.price.toFixed(2)}</p>
          <div class="product-actions">
            <input type="number" min="1" value="1" class="quantity-input" />
            <button class="add-to-cart-button">Adicionar ao Carrinho</button>
            <button class="view-details-button">Ver Detalhes</button>
          </div>
        `;

        // Evento para adicionar ao carrinho
        productElement
          .querySelector(".add-to-cart-button")
          .addEventListener("click", () => {
            const quantity =
              parseInt(productElement.querySelector(".quantity-input").value) ||
              1;
            addToCart(product, quantity);
          });

        // Evento para visualizar detalhes
        productElement
          .querySelector(".view-details-button")
          .addEventListener("click", () => {
            window.location.href = `product.html?id=${product.id}`;
          });

        productsContainer.appendChild(productElement);
      });
    })
    .catch((error) => console.error("Erro ao carregar produtos:", error));
}

function removeFromCart(index) {
  cart.splice(index, 1); // Remove o item do carrinho
  localStorage.setItem("cart", JSON.stringify(cart)); // Atualiza o localStorage
  updateCartSummary(); // Atualiza o resumo do carrinho
}

function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!productId) return;

  fetch(`${API_URL}/${productId}`)
    .then((response) => response.json())
    .then((product) => {
      const productDetails = document.getElementById("productDetails");
      if (!productDetails) return;

      productDetails.innerHTML = `
            <img src="${product.image}" alt="${product.title}" />
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p>R$ ${product.price.toFixed(2)}</p>
            <div class="product-actions">
              <input type="number" min="1" value="1" id="quantityInput" />
              <button id="addToCartButton">Adicionar ao Carrinho</button>
            </div>
          `;

      // Evento para o botão "Adicionar ao Carrinho"
      const addToCartButton = document.getElementById("addToCartButton");
      const quantityInput = document.getElementById("quantityInput");

      addToCartButton.addEventListener("click", () => {
        const quantity = parseInt(quantityInput.value) || 1;
        addToCart(product, quantity);
        alert("Produto adicionado ao carrinho!");
        updateCartButton(); // Atualiza o contador do carrinho no botão
      });
    })
    .catch((error) =>
      console.error("Erro ao carregar os detalhes do produto:", error)
    );
}

// Carrega o script para a página correta
document.addEventListener("DOMContentLoaded", () => {
  const pageTitle = document.title; // Obtém o título da página

  if (pageTitle === "Catálogo de Produtos") {
    updateCartButton();
    loadProducts();
  } else if (pageTitle === "Carrinho") {
    updateCartSummary();
  } else if (pageTitle === "Detalhes do Produto") {
    loadProductDetails();
    updateCartButton(); // Atualiza o botão do carrinho nesta página
  }
});
