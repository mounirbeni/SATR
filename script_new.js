// ============================================
// Language Management
// ============================================

let currentLanguage = 'en';

function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

function setLanguage(lang) {
    currentLanguage = lang;

    // Update active button
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

    // Update page content
    updatePageContent(lang);

    // Update text direction for Arabic
    if (lang === 'ar') {
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
        document.body.dir = 'rtl';
    } else {
        document.documentElement.lang = lang;
        document.documentElement.dir = 'ltr';
        document.body.dir = 'ltr';
    }

    // Save preference
    localStorage.setItem('preferredLanguage', lang);
}

function updatePageContent(lang) {
    const elements = document.querySelectorAll('[data-en]');
    elements.forEach(element => {
        const content = element.getAttribute(`data-${lang}`);
        if (content) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = content;
            } else if (element.tagName === 'SELECT' && element.querySelector('option')) {
                const firstOption = element.querySelector('option:first-child');
                if (firstOption) {
                    firstOption.textContent = content;
                }
            } else {
                element.textContent = content;
            }
        }
    });

    // Translate select options
    const selectOptions = {
        'Select Grade Level': { fr: 'Sélectionnez le niveau de classe', ar: 'اختر مستوى الفئة' },
        'Grade 1': { fr: 'Classe 1', ar: 'الصف الأول' },
        'Grade 2': { fr: 'Classe 2', ar: 'الصف الثاني' },
        'Grade 3': { fr: 'Classe 3', ar: 'الصف الثالث' },
        'Grade 4': { fr: 'Classe 4', ar: 'الصف الرابع' },
        'Grade 5': { fr: 'Classe 5', ar: 'الصف الخامس' },
        'Grade 6': { fr: 'Classe 6', ar: 'الصف السادس' },
        'Multiple Grades': { fr: 'Plusieurs classes', ar: 'فئات متعددة' }
    };

    const gradeLevelSelect = document.getElementById('gradeLevel');
    if (gradeLevelSelect) {
        const options = gradeLevelSelect.querySelectorAll('option');
        options.forEach(option => {
            const englishText = option.textContent.trim();
            if (selectOptions[englishText] && selectOptions[englishText][lang]) {
                option.textContent = selectOptions[englishText][lang];
            }
        });
    }

    // Update input placeholders
    const placeholders = {
        fullName: { en: 'Your full name', fr: 'Votre nom complet', ar: 'اسمك الكامل' },
        phone: { en: '+212 6XX XXX XXX', fr: '+212 6XX XXX XXX', ar: '+212 6XX XXX XXX' },
        email: { en: 'your.email@example.com', fr: 'votre.email@example.com', ar: 'your.email@example.com' },
        location: { en: 'e.g., Casablanca, Rabat', fr: 'ex. Casablanca, Rabat', ar: 'مثال: الدار البيضاء، الرباط' }
    };

    Object.keys(placeholders).forEach(id => {
        const element = document.getElementById(id);
        if (element && placeholders[id][lang]) {
            element.placeholder = placeholders[id][lang];
        }
    });
}

function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLang);
}

// ============================================
// Form Handling
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Load language preference
    loadLanguagePreference();

    // Initialize language switcher
    initLanguageSwitcher();

    const orderForm = document.getElementById('orderForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    // Form submission
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            location: document.getElementById('location').value.trim(),
            gradeLevel: document.getElementById('gradeLevel').value,
            timestamp: new Date().toLocaleString()
        };

        if (validateForm(formData)) {
            // Netlify Submission
            const payload = new FormData(orderForm);

            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(payload).toString()
            })
                .then(() => {
                    storeOrderData(formData);
                    showConfirmation();
                    console.log('Order submitted successfully');
                })
                .catch((error) => {
                    console.error('Submission error:', error);
                    alert('There was an error submitting your order. Please try again.');
                });
        }
    });

    function validateForm(data) {
        if (!/^[a-zA-Z\s]+$/.test(data.fullName)) {
            alert('Please enter a valid name');
            return false;
        }

        if (!/^[\d\s+\-()]+$/.test(data.phone) || data.phone.length < 7) {
            alert('Please enter a valid phone number');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            alert('Please enter a valid email');
            return false;
        }

        if (data.location.length === 0) {
            alert('Please enter your city/region');
            return false;
        }

        if (data.gradeLevel === '') {
            alert('Please select a grade level');
            return false;
        }

        return true;
    }

    function storeOrderData(data) {
        let orders = JSON.parse(localStorage.getItem('edukitOrders')) || [];
        orders.push(data);
        localStorage.setItem('edukitOrders', JSON.stringify(orders));
    }

    function showConfirmation() {
        orderForm.style.display = 'none';
        confirmationMessage.classList.remove('hidden');
        confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

function resetForm() {
    const orderForm = document.getElementById('orderForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    orderForm.reset();
    orderForm.style.display = 'block';
    confirmationMessage.classList.add('hidden');
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// Additional Features
// ============================================

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Phone number formatting
document.getElementById('phone')?.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
        if (value.length <= 3) {
            e.target.value = '+' + value;
        } else if (value.length <= 6) {
            e.target.value = '+' + value.slice(0, 1) + ' ' + value.slice(1, 4) + ' ' + value.slice(4);
        } else {
            e.target.value = '+' + value.slice(0, 1) + ' ' + value.slice(1, 4) + ' ' + value.slice(4, 7) + ' ' + value.slice(7, 11);
        }
    }
});

// Capitalize names
document.getElementById('fullName')?.addEventListener('blur', function (e) {
    const words = e.target.value.trim().split(/\s+/);
    const capitalized = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    e.target.value = capitalized;
});

console.log('%cEduKit Pro - Modern Design', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%cTransforming education for Moroccan teachers', 'color: #6b7280;');
