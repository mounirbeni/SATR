document.addEventListener('DOMContentLoaded', () => {
    // --- Smooth scroll for "Order Now" button ---
    const orderButton = document.querySelector('.btn[href="#order"]');
    if (orderButton) {
        orderButton.addEventListener('click', function (e) {
            e.preventDefault();
            const orderSection = document.getElementById('order');
            if (orderSection) {
                orderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // --- Order Form Submission ---
    const orderForm = document.getElementById('order-form');
    const successMessage = document.getElementById('success-message');

    if (orderForm && successMessage) {
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent the default form submission

            // Netlify Submission
            const formData = new FormData(orderForm);

            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
                .then(() => {
                    // Hide the form
                    orderForm.style.display = 'none';

                    // Show the success message
                    successMessage.style.display = 'block';
                })
                .catch((error) => {
                    alert('Submission failed. Please try again.');
                    console.error(error);
                });

            // Optional: You could reset the form after a delay if needed
            // setTimeout(() => {
            //     orderForm.reset();
            //     orderForm.style.display = 'block';
            //     successMessage.style.display = 'none';
            // }, 10000); // Reset after 10 seconds
        });
    }
});