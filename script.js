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

    // Update all translatable elements
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
            // Check if this is an input placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = content;
            } else if (element.tagName === 'SELECT' && element.querySelector('option')) {
                // For select, update the first option if needed
                const firstOption = element.querySelector('option:first-child');
                if (firstOption) {
                    firstOption.textContent = content;
                }
            } else {
                element.textContent = content;
            }
        }
    });

    // Translate option labels
    const selectOptions = {
        'Grade 1': { fr: 'Classe 1', ar: 'الصف الأول' },
        'Grade 2': { fr: 'Classe 2', ar: 'الصف الثاني' },
        'Grade 3': { fr: 'Classe 3', ar: 'الصف الثالث' },
        'Grade 4': { fr: 'Classe 4', ar: 'الصف الرابع' },
        'Grade 5': { fr: 'Classe 5', ar: 'الصف الخامس' },
        'Grade 6': { fr: 'Classe 6', ar: 'الصف السادس' },
        'Multiple Grades': { fr: 'Plusieurs classes', ar: 'فئات متعددة' },
        'Admin/Coordinator': { fr: 'Admin/Coordinateur', ar: 'الإدارة / المنسق' }
    };

    const gradeLevelSelect = document.getElementById('gradeLevel');
    if (gradeLevelSelect) {
        const options = gradeLevelSelect.querySelectorAll('option');
        options.forEach(option => {
            const englishText = option.textContent.trim();
            if (selectOptions[englishText] && selectOptions[englishText][lang]) {
                option.textContent = selectOptions[englishText][lang];
            } else if (englishText === '-- Select Grade Level --') {
                if (lang === 'fr') {
                    option.textContent = '-- Sélectionnez le niveau de classe --';
                } else if (lang === 'ar') {
                    option.textContent = '-- اختر مستوى الفئة --';
                }
            }
        });
    }

    // Update input placeholders if they exist
    const placeholders = {
        fullName: { en: 'Enter your full name', fr: 'Entrez votre nom complet', ar: 'أدخل اسمك الكامل' },
        phone: { en: 'e.g., +212 6XX XXX XXX', fr: 'ex. +212 6XX XXX XXX', ar: 'مثال: +212 6XX XXX XXX' },
        email: { en: 'your.email@example.com', fr: 'votre.email@example.com', ar: 'your.email@example.com' },
        location: { en: 'e.g., Casablanca, Rabat, Fes', fr: 'ex. Casablanca, Rabat, Fès', ar: 'مثال: الدار البيضاء، الرباط، فاس' }
    };

    Object.keys(placeholders).forEach(id => {
        const element = document.getElementById(id);
        if (element && placeholders[id][lang]) {
            element.placeholder = placeholders[id][lang];
        }
    });
}

// Load saved language preference on page load
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    setLanguage(savedLang);
}

// ============================================
// Form Handling and Submission
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    // Load saved language preference
    loadLanguagePreference();

    // Initialize language switcher
    initLanguageSwitcher();

    const orderForm = document.getElementById('orderForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    // Form submission handler
    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            location: document.getElementById('location').value.trim(),
            gradeLevel: document.getElementById('gradeLevel').value,
            timestamp: new Date().toLocaleString()
        };

        // Validate form data
        if (!validateForm(formData)) {
            return;
        }


        // Netlify Submission
        const payload = new FormData(orderForm);

        fetch('/', {
            method: 'POST',
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(payload).toString()
        })
            .then(() => {
                // Store data locally (optional backup)
                storeOrderData(formData);

                // Show confirmation message
                showConfirmation();
            })
            .catch((error) => {
                console.error('Submission error:', error);
                alert('There was an error submitting your order. Please try again.');
            });
    });

    // Form validation
    function validateForm(data) {
        // Check if name contains only letters and spaces
        if (!/^[a-zA-Z\s]+$/.test(data.fullName)) {
            alert('Please enter a valid name (letters and spaces only)');
            return false;
        }

        // Check if phone is valid
        if (!/^[\d\s+\-()]+$/.test(data.phone) || data.phone.length < 7) {
            alert('Please enter a valid phone number');
            return false;
        }

        // Check if email is valid
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            alert('Please enter a valid email address');
            return false;
        }

        // Check if location is not empty
        if (data.location.length === 0) {
            alert('Please enter your city/country');
            return false;
        }

        // Check if grade level is selected
        if (data.gradeLevel === '') {
            alert('Please select a grade level');
            return false;
        }

        return true;
    }

    // Store order data
    function storeOrderData(data) {
        // Save to localStorage for demonstration
        let orders = JSON.parse(localStorage.getItem('eduKitOrders')) || [];
        orders.push(data);
        localStorage.setItem('eduKitOrders', JSON.stringify(orders));

        // In a real application, you would send this data to a server
        // Example:
        // fetch('/api/orders', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(data)
        // })
        // .then(response => response.json())
        // .then(data => console.log('Order saved:', data))
        // .catch(error => console.error('Error:', error));
    }

    // Show confirmation message
    function showConfirmation() {
        // Hide the form
        orderForm.style.display = 'none';

        // Show confirmation message
        confirmationMessage.classList.remove('hidden');

        // Scroll to confirmation message
        confirmationMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});

// Reset form and show form again
function resetForm() {
    const orderForm = document.getElementById('orderForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    // Clear form fields
    orderForm.reset();

    // Show form
    orderForm.style.display = 'block';

    // Hide confirmation message
    confirmationMessage.classList.add('hidden');

    // Scroll to form
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// Additional Features
// ============================================

// Auto-format phone number as user types
document.getElementById('phone')?.addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');

    // Format as: +1 (555) 123-4567
    if (value.length > 0) {
        if (value.length <= 3) {
            e.target.value = '+' + value;
        } else if (value.length <= 6) {
            e.target.value = '+' + value.slice(0, 1) + ' (' + value.slice(1, 4) + ') ' + value.slice(4);
        } else {
            e.target.value = '+' + value.slice(0, 1) + ' (' + value.slice(1, 4) + ') ' + value.slice(4, 7) + '-' + value.slice(7, 11);
        }
    }
});

// Capitalize first letter of name as user types
document.getElementById('fullName')?.addEventListener('blur', function (e) {
    const words = e.target.value.trim().split(/\s+/);
    const capitalizedName = words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    e.target.value = capitalizedName;
});

// Capitalize first letter of location
document.getElementById('location')?.addEventListener('blur', function (e) {
    const value = e.target.value.trim();
    const parts = value.split(',').map(part => {
        return part.trim()
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    });
    e.target.value = parts.join(', ');
});

// ============================================
// Console Message
// ============================================

console.log('%cEduKit Pro - Order Form', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('%cOrders are stored in browser localStorage for demonstration.', 'color: #6b7280;');
console.log('%cIn production, connect this form to your backend server.', 'color: #6b7280;');
