document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', async function() {
        const itemName = this.getAttribute('data-product-name');
        const itemPrice = this.getAttribute('data-product-price');

        try {
            // Fetch the user's email
            const emailResponse = await fetch('http://127.0.0.1:3000/get-logged-in-email');
            if (!emailResponse.ok) {
                throw new Error('Network response was not ok');
            }
            const emailData = await emailResponse.json();
            const userEmail = emailData.email;

            // Make the 'add-to-cart' request with the user's email
            const addToCartResponse = await fetch('http://127.0.0.1:3000/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: itemName,
                    price: itemPrice,
                    email: userEmail, // Include the user's email in the request
                }),
                credentials: 'include'
            });

            if (!addToCartResponse.ok) {
                throw new Error('Network response was not ok');
            }

            const addToCartData = await addToCartResponse.json();
            if (addToCartData.success) {
                // Handle success scenario e.g. update cart count
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error.message);
        }
    });
});

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
