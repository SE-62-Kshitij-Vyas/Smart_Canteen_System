// Fetch cart items when page loads
let cartData = null;
let loggedInUserEmail = null;

function toggleNav() {
    let sidenav = document.getElementById("mySidenav");
    if (sidenav.style.width === "15%") {
        sidenav.style.width = "0";
        document.body.style.marginLeft = "0";
    } else {
        sidenav.style.width = "15%";
        document.body.style.marginLeft = "15%";
    }
}

fetch('http://localhost:3000/cart-items')
    .then(response => response.json())
    .then(data => {
        console.log('Fetched cart items:', data);
        const cartItemsElement = document.getElementById('cart-items');
        let total = 0;

        cartData = data.items;
        console.log(cartData);

        // Clear existing rows
        cartItemsElement.innerHTML = '';

        data.items.forEach(item => {
            total += item.price * item.quantity;

            // Create a new table row
            const tr = document.createElement('tr');

            // Product Name
            const tdName = document.createElement('td');
            tdName.textContent = item.name;
            tr.appendChild(tdName);

            // Price
            const tdPrice = document.createElement('td');
            tdPrice.textContent = item.price;
            tr.appendChild(tdPrice);

            // Quantity (input field)
            const tdQuantity = document.createElement('td');
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.value = item.quantity;
            quantityInput.className = 'item-quantity';
            quantityInput.style.margin = "0 10px";
            quantityInput.style.width = "40px";
            quantityInput.setAttribute('data-id', item._id);
            tdQuantity.appendChild(quantityInput);
            tr.appendChild(tdQuantity);

            // Subtotal
            const tdSubtotal = document.createElement('td');
            tdSubtotal.textContent = item.price * item.quantity;
            tr.appendChild(tdSubtotal);

            // Append the row to the table body
            cartItemsElement.appendChild(tr);
        });

        document.getElementById('total-price').textContent = 'Rs.' + total.toFixed(2);
    });

document.getElementById('clear-cart-btn').addEventListener('click', () => {
    fetch('http://127.0.0.1:3000/clear-cart', {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                throw Error(text || 'Failed to clear cart');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Clear cart response:', data);
        if (data.success) {
            // Handle success scenario, maybe show a message or refresh cart display
            alert("Cart cleared successfully!");
        }
    })
    .catch(error => {
        console.error('Failed to clear the cart:', error.message);
    });
});

fetch('http://127.0.0.1:3000/get-logged-in-email')
    .then(response => response.json())
    .then(data => {
        loggedInUserEmail = data.email;
        console.log('Logged in user email:', loggedInUserEmail);
    })
    .catch(error => {
        console.error("Error fetching logged in email:", error);
    });

    function placeOrder() {
        fetch('http://localhost:3000/place-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: loggedInUserEmail }),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text || 'Failed to place order');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Place order response:', data);
            if (data.success) {
                // Handle success scenario, maybe show a message or refresh cart display
                alert("Order placed successfully!");
                
                // Clear the cart in the frontend
                const cartItemsElement = document.getElementById('cart-items');
                cartItemsElement.innerHTML = '';
    
                // Update the total price
                document.getElementById('total-price').textContent = 'Rs.0.00';
            }
        })
        .catch(error => {
            console.error('Failed to place the order:', error.message);
        });
    }
    
    // Add a click event listener for the "Place Order" button
    document.getElementById('proceed-to-checkout').addEventListener('click', placeOrder);

    
    document.addEventListener('input', function (event) {
        if (event.target.classList.contains('item-quantity')) {
            const itemId = event.target.getAttribute('data-id');
            const newQuantity = parseInt(event.target.value);
    
            // Update the quantity in the frontend
            updateQuantityInFrontend(itemId, newQuantity);
    
            // Send a request to the server to update the quantity in the cart
            updateQuantityInCart(itemId, newQuantity);
        }
    });

    function updateQuantityInFrontend(itemId, newQuantity) {
        const item = cartData.find(item => item._id === itemId);
        if (item) {
            item.quantity = newQuantity;
    
            // Update the subtotal in the frontend
            const tdSubtotal = document.querySelector(`[data-id="${itemId}"]`).parentElement.nextElementSibling;
            tdSubtotal.textContent = (item.price * newQuantity).toFixed(2);
    
            // Recalculate the total price
            let total = 0;
            cartData.forEach(item => {
                total += item.price * item.quantity;
            });
            document.getElementById('total-price').textContent = 'Rs.' + total.toFixed(2);
        }
    }

    function updateQuantityInCart(itemId, newQuantity) {
        fetch('http://localhost:3000/update-cart-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ itemId, newQuantity }),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw Error(text || 'Failed to update item quantity');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Update item quantity response:', data);
        })
        .catch(error => {
            console.error('Failed to update item quantity:', error.message);
        });
    }
