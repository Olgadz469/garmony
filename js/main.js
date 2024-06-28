// слайдер
document.addEventListener("DOMContentLoaded", (event) => {
  const swiperBlog = new Swiper(".blog__inner", {
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    loop: true,
    // effect: "fade",
  });
});

// бургер меню
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu__btn");
  const menuBtnClose = document.querySelector(".menu__btn--close");
  const menuList = document.querySelector(".header__menu-list");

  menuBtn.addEventListener("click", () => {
    menuList.classList.add("menu-open");
    menuBtn.style.display = "none";
    menuBtnClose.style.display = "block";
  });
  menuBtnClose.addEventListener("click", () => {
    menuList.classList.remove("menu-open");
    menuBtn.style.display = "block";
    menuBtnClose.style.display = "none";
  });
});

// корзина

document.addEventListener("DOMContentLoaded", () => {
  let cart = [];
  const cartItemsContainer = document.querySelector(".cart__items");
  const totalPriceElement = document.querySelector(".total-price");
  const checkoutButton = document.querySelector(".checkout");
  const orderForm = document.getElementById("order-form");
  const cartIcon = document.querySelector(".cart-icon");
  const cartCount = document.querySelector(".cart-count");
  const cartModal = document.querySelector(".cart-modal");
  const checkoutModal = document.querySelector(".checkout-modal");
  const closeButtons = document.querySelectorAll(".close");

  // Функция сохранения корзины в Local Storage
  function saveCartToLocalStorage(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Функция загрузки корзины из Local Storage
  function loadCartFromLocalStorage() {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateCart();
  }

  function updateCart() {
    cartItemsContainer.innerHTML = "";
    let totalPrice = 0;
    let totalItems = 0;

    cart.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        ${item.name} - ${item.price} грн x ${item.quantity}
        <button class="decrease-quantity" data-id="${item.id}">-</button>
        <button class="increase-quantity" data-id="${item.id}">+</button>
        <button class="remove-item" data-id="${item.id}">Видалити</button>
      `;
      cartItemsContainer.appendChild(listItem);
      totalPrice += item.price * item.quantity;
      totalItems += item.quantity;
    });

    totalPriceElement.textContent = `${totalPrice} грн`;
    cartCount.textContent = totalItems;
    saveCartToLocalStorage(cart); // Сохранение корзины после обновления
    attachCartEventListeners();
  }

  function attachCartEventListeners() {
    document.querySelectorAll(".decrease-quantity").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const cartItem = cart.find((item) => item.id === id);
        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1;
        } else {
          cart.splice(cart.indexOf(cartItem), 1);
        }
        updateCart();
      });
    });

    document.querySelectorAll(".increase-quantity").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const cartItem = cart.find((item) => item.id === id);
        cartItem.quantity += 1;
        updateCart();
      });
    });

    document.querySelectorAll(".remove-item").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.id;
        const cartItem = cart.find((item) => item.id === id);
        cart.splice(cart.indexOf(cartItem), 1);
        updateCart();
      });
    });
  }

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const shopItem = button.parentElement;
      const id = shopItem.dataset.id;
      const name = shopItem.querySelector("h4").textContent;
      const price = parseInt(shopItem.querySelector(".price").textContent);

      const cartItem = cart.find((item) => item.id === id);
      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }

      updateCart();
    });
  });

  // При загрузке страницы восстанавливаем данные корзины
  loadCartFromLocalStorage();

  cartIcon.addEventListener("click", () => {
    cartModal.style.display = "block";
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      cartModal.style.display = "none";
      checkoutModal.style.display = "none";
    });
  });

  checkoutButton.addEventListener("click", () => {
    cartModal.style.display = "none";
    checkoutModal.style.display = "block";
  });

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = orderForm.name.value;
    const phone = orderForm.phone.value;
    const email = orderForm.email.value;

    const order = {
      customer: {
        name,
        phone,
        email,
      },
      items: cart,
    };

    // Заполнить скрытые поля данными корзины и общей стоимости
    document.getElementById("cartItems").value = JSON.stringify(cart);
    document.getElementById("totalPrice").value = calculateTotalPrice(cart);

    function calculateTotalPrice(cart) {
      return cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    }

    console.log("Order:", order);

    // // Валидация формы
    const errorMessageContainer = document.getElementById("error-message");
    errorMessageContainer.textContent = "";
    let hasError = false;

    if (!name) {
      errorMessageContainer.textContent += "Введіть ваше ім'я.\n";
      hasError = true;
      console.log("Name validation failed");
    }

    if (!email) {
      errorMessageContainer.textContent += "Введіть вашу електронну пошту.\n";
      hasError = true;
      console.log("Email validation failed (empty)");
    } else if (!validateEmail(email)) {
      errorMessageContainer.textContent +=
        "Введіть коректну адресу електронної пошти.\n";
      hasError = true;
      console.log("Email validation failed (invalid format)");
    }

    if (!phone) {
      errorMessageContainer.textContent += "Введіть ваш номер телефона.\n";
      hasError = true;
      console.log("Phone validation failed (empty)");
    } else if (!validatePhoneNumber(phone)) {
      errorMessageContainer.textContent +=
        "Введіть коректний номер телефона.\n";
      hasError = true;
      console.log("Phone validation failed (invalid format)");
    }

    if (hasError) {
      console.log("Form submission prevented due to validation errors");
      return;
    }

    // Proceed with form submission
    orderForm.submit();

    alert("Ваше замовлення було відправлено!");

    cart.length = 0;
    updateCart();
    orderForm.reset();
    checkoutModal.style.display = "none";
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  window.addEventListener("click", (event) => {
    if (event.target === cartModal) {
      cartModal.style.display = "none";
    }
    if (event.target === checkoutModal) {
      checkoutModal.style.display = "none";
    }
  });

  // бронирование столика

  const bookButtons = document.querySelectorAll(".book-btn");
  const bookModal = document.querySelector(".modal.bookform");
  const bookForm = document.getElementById("book-form");

  bookButtons.forEach((bookButton) => {
    bookButton.addEventListener("click", () => {
      bookModal.style.display = "block";
    });

    closeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        bookModal.style.display = "none";
      });
    });

    bookForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = bookForm.name.value;
      const phone = bookForm.phone.value;

      bookForm.submit();

      alert("Ваше замовлення було відправлено!");

      bookForm.reset();
      bookModal.style.display = "none";
    });
  });
});

// gallery

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".gallery__btn");
  const items = document.querySelectorAll(".gallery__content-item");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      buttons.forEach((btn) => btn.classList.remove("gallery__btn--active"));

      // Add active class to the clicked button
      button.classList.add("gallery__btn--active");

      // Get the filter value
      const filter = button.getAttribute("data-filter");

      // Show/Hide items based on the filter
      items.forEach((item) => {
        if (item.id === filter) {
          item.classList.add("gallery__content-item--active");
        } else {
          item.classList.remove("gallery__content-item--active");
        }
      });
    });
  });
});
