document.addEventListener('DOMContentLoaded', () => {
    // Fetch user data from the new endpoint
    fetch('http://localhost:3000/retrieve-current-user-data') // Change the URL as needed
        .then(response => response.json())
        .then(data => {
            const userEmail = data.email;
            const userPhone = data.phone;
            const pastOrders = data.pastOrders;

            document.getElementById('user-email').textContent = userEmail;
            document.getElementById('user-phone').textContent = userPhone;

            const orderList = document.getElementById('order-list');

            if (!pastOrders || pastOrders.length === 0) {
                orderList.innerHTML = '<p>No past orders available.</p>';
            } else {
                pastOrders.forEach(cartItem => {
                    if (cartItem) {
                        const orderItem = document.createElement('li');
                        orderItem.textContent = `Name: ${cartItem.name}, Price: Rs.${cartItem.price}, Quantity: ${cartItem.quantity}`;
                        orderList.appendChild(orderItem);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
        });
});

// Additional JavaScript code for other functionality can be added here.
