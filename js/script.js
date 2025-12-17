let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let currentSlide = 0;
let autoSlideInterval;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.querySelector('.progress-dots');
const themeButton = document.querySelector('.theme-switcher');
const logoImage = document.getElementById('logoImage');
let pendingUser = null;
let verificationCode = '';
let currentProductImage = 0;
let favorites = JSON.parse(localStorage.getItem('favorites')) || {};

function generateCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

function initSlider() {
    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (index === 0 ? ' active' : '');
        dot.onclick = () => changeSlide(index);
        dotsContainer.appendChild(dot);
    });
}

function changeSlide(index) {
    currentSlide = index;
    updateSlider();
    resetAutoSlide();
}

function updateSlider() {
    slides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === currentSlide);
    });
    document.querySelectorAll('.dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlide);
    });
    document.querySelector('.slides-track').style.transform = `translateX(-${currentSlide * 100}%)`;
}

function nextSlide(e) {
    e.preventDefault();
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
    resetAutoSlide();
}

function prevSlide(e) {
    e.preventDefault();
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
    resetAutoSlide();
}

function redirectToCatalog(e) {
    e.preventDefault();
    e.currentTarget.style.animation = 'clickEffect 0.4s ease';
    setTimeout(() => {
        window.location.href = 'https://allgameg87.github.io/AHS-Catalog/';
    }, 400);
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        const event = { preventDefault: () => {} };
        nextSlide(event);
    }, 5000);
}

function updateAuthButtons() {
    const authButtons = document.getElementById('authButtons');
    authButtons.innerHTML = currentUser ? 
        `<div class="user-info">
            <span>${currentUser.name}</span>
            <button class="logout-btn" onclick="logout()">Выйти</button>
        </div>` :
        `<button class="auth-button" onclick="showModal('login')">Вход/Регистрация</button>`;
}

function register(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    
    if(users.some(u => u.email === email)) {
        alert('Этот email уже зарегистрирован!');
        return;
    }

    pendingUser = {
        name: formData.get('text'),
        email: email,
        password: formData.get('password'),
        verified: false
    };

    verificationCode = generateCode();
    alert(`Код подтверждения: ${verificationCode} (В реальном приложении будет отправлен на email)`);
    document.getElementById('registerModal').style.display = 'none';
    showModal('code');
}

function verifyCode() {
    const inputCode = document.querySelector('.code-input').value;
    if(inputCode === verificationCode) {
        users.push(pendingUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = pendingUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthButtons();
        document.getElementById('codeModal').style.display = 'none';
        alert('Регистрация завершена!');
    } else {
        alert('Неверный код подтверждения!');
    }
}

function login(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const user = users.find(u => 
        u.email === formData.get('email') && 
        u.password === formData.get('password')
    );
    
    if(user) {
        if(!user.verified) {
            alert('Аккаунт не подтвержден!');
            return;
        }
        verificationCode = generateCode();
        alert(`Код подтверждения: ${verificationCode}`);
        document.getElementById('loginModal').style.display = 'none';
        showModal('loginConfirm');
    } else {
        alert('Неверные данные!');
    }
}

function confirmLogin() {
    const inputCode = document.querySelector('#loginConfirmModal .code-input').value;
    if(inputCode === verificationCode) {
        currentUser = users.find(u => u.email === pendingUser?.email);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthButtons();
        document.getElementById('loginConfirmModal').style.display = 'none';
    } else {
        alert('Неверный код подтверждения!');
    }
}

function showForgotPassword() {
    alert('Функция восстановления пароля в разработке');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthButtons();
}

function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    themeButton.textContent = isDarkMode ? '🌞' : '🌙';
    updateLogo(isDarkMode);
}

function updateLogo(isDarkMode) {
    logoImage.src = isDarkMode ? 'logo-dark.png' : 'logo-light.png';
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';
    
    if(isDarkMode) {
        document.body.classList.add('dark-mode');
        themeButton.textContent = '🌞';
    }
    
    updateLogo(isDarkMode);
}

function showModal(type) {
    document.getElementById(`${type}Modal`).style.display = 'block';
}

function toggleMenu() {
    document.querySelector('.menu-toggle').classList.toggle('active');
    document.querySelector('.sidebar-menu').classList.toggle('active');
}

function toggleFavorite(event, productId) {
    event.stopPropagation();
    
    if (!currentUser) {
        showModal('login');
        return;
    }
    
    const heart = event.currentTarget;
    const isActive = heart.classList.toggle('active');
    
    if (isActive) {
        // Добавляем в избранное
        if (!favorites[currentUser.email]) {
            favorites[currentUser.email] = [];
        }
        if (!favorites[currentUser.email].includes(productId)) {
            favorites[currentUser.email].push(productId);
        }
    } else {
        // Удаляем из избранного
        if (favorites[currentUser.email]) {
            const index = favorites[currentUser.email].indexOf(productId);
            if (index > -1) {
                favorites[currentUser.email].splice(index, 1);
            }
        }
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function openProductModal(title, price, description, material, sizes, colors, country, img1, img2, img3) {
    document.getElementById('productModalTitle').textContent = title;
    document.getElementById('productModalPrice').textContent = price;
    document.getElementById('productModalDescription').textContent = description;
    document.getElementById('productModalMaterial').textContent = material;
    document.getElementById('productModalSizes').textContent = sizes;
    document.getElementById('productModalColors').textContent = colors;
    document.getElementById('productModalCountry').textContent = country;
    
    document.getElementById('productImage1').src = img1;
    document.getElementById('productImage1').alt = title;
    document.getElementById('productImage2').src = img2;
    document.getElementById('productImage2').alt = title;
    document.getElementById('productImage3').src = img3;
    document.getElementById('productImage3').alt = title;
    
    currentProductImage = 0;
    updateProductSlider();
    updateSliderIndicator();
    document.getElementById('productModal').style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function prevProductImage() {
    if (currentProductImage > 0) {
        currentProductImage--;
        updateProductSlider();
        updateSliderIndicator();
    }
}

function nextProductImage() {
    if (currentProductImage < 2) {
        currentProductImage++;
        updateProductSlider();
        updateSliderIndicator();
    }
}

function goToProductImage(index) {
    currentProductImage = index;
    updateProductSlider();
    updateSliderIndicator();
}

function updateProductSlider() {
    const slider = document.getElementById('productImageSlider');
    slider.style.transform = `translateX(-${currentProductImage * 33.333}%)`;
}

function updateSliderIndicator() {
    const dots = document.querySelectorAll('.product-slider-dot');
    dots.forEach((dot, index) => {
        if (index === currentProductImage) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function addToCartFromModal() {
    if (!currentUser) {
        closeProductModal();
        showModal('login');
    } else {
        alert('Товар добавлен в корзину!');
        closeProductModal();
    }
}

function initFavorites() {
    if (currentUser && favorites[currentUser.email]) {
        favorites[currentUser.email].forEach(productId => {
            const heart = document.querySelector(`[onclick="toggleFavorite(event, '${productId}')]`);
            if (heart) {
                heart.classList.add('active');
            }
        });
    }
}

window.onclick = function(e) {
    if(e.target.className === 'modal' || e.target.className === 'product-modal') {
        e.target.style.display = 'none';
    }
    if(!e.target.closest('.sidebar-menu') && !e.target.closest('.menu-toggle')) {
        document.querySelector('.sidebar-menu').classList.remove('active');
        document.querySelector('.menu-toggle').classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSlider();
    updateAuthButtons();
    initFavorites();
    resetAutoSlide();
    document.getElementById('registerForm').onsubmit = register;
    document.getElementById('loginForm').onsubmit = login;
    themeButton.addEventListener('click', toggleTheme);
});

