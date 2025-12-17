document.addEventListener('DOMContentLoaded', function () {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle Order Form Submission
    const orderForm = document.getElementById('order-form');
    const successMessage = document.getElementById('success-message');

    if (orderForm) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic validation (HTML5 'required' attribute handles most of it)
            const formData = new FormData(orderForm);
            const data = Object.fromEntries(formData.entries());

            // Netlify Form Submission
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
                .then(() => {
                    console.log('Order Submitted Successfully');

                    // Hide form and show success message with a smooth transition
                    orderForm.style.opacity = '0';

                    setTimeout(() => {
                        orderForm.style.display = 'none';
                        successMessage.style.display = 'block';

                        // Trigger reflow to enable transition
                        void successMessage.offsetWidth;

                        successMessage.style.opacity = '1';

                        // Scroll to success message if needed
                        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                })
                .catch((error) => {
                    console.error('Form submission error:', error);
                    alert('There was an error submitting your order. Please try again.');
                });
        });
    }

    // Add some simple animation to elements on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Fade-in animation class
    const style = document.createElement('style');
    style.innerHTML = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in.visible {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Apply fade-in to major sections
    document.querySelectorAll('section, .hero').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
});
