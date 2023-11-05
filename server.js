let lastLoggedInEmail = null;
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const validator = require('validator');




const app = express();
const PORT = 3000;


app.use(cors({
    origin: 'http://127.0.0.1:5501',  
    credentials: true,
    methods: ['GET', 'POST']
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const cartItemSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: {
        type: Number,
        default: 1
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const CartItem = mongoose.model('CartItem', cartItemSchema);


const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    securityQuestion: String,
    securityAnswer: String,
    carts: [
        [cartItemSchema] // Array of arrays representing past orders
    ]
});

const User = mongoose.model('User', UserSchema);

const feedbackSchema = new mongoose.Schema({
    email: String,
    rating: {
        type: Number,
        //required: true,
        min: 1,
        max: 5, // Assuming a 5-star rating system
    },
    feedback: String,
    date: { type: Date, default: Date.now },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);


app.use(bodyParser.json());

function isStrongPassword(password) {
    // Password should be at least 8 characters long and contain a mix of letters, numbers, and special characters
    return validator.isLength(password, { min: 8 }) && validator.matches(password, /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/);
}

app.post('/register', async (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const password=req.body.password;

    if (!validator.isEmail(email)) {
        return res.status(400).send({ error: 'Invalid Email ID' });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).send({ error: 'Password is not strong enough' });
    }

    const existingUserByMobile = await User.findOne({mobile:req.body.mobile});
    if (existingUserByMobile) {
        return res.status(400).send({ error: 'Mobile number is already registered' });
    }

    const existingUserByEmail = await User.findOne({email: req.body.email});
    if (existingUserByEmail) {
        return res.status(400).send({ error: 'Email is already registered' });
    }

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const hashedAnswer = await bcrypt.hash(req.body.securityAnswer, 10);

        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            mobile: req.body.mobile,
            securityQuestion: req.body.securityQuestion,
            securityAnswer: hashedAnswer
        });

        await user.save();
        res.status(201).send({ success: 'User registered' });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const email = req.body.email;

    if (!validator.isEmail(email)) {
        return res.status(400).send({ error: 'Invalid Email ID' });
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }
        
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        
        if (!isMatch) {
            return res.status(400).send({ error: 'Incorrect password' });
        }
        lastLoggedInEmail = user.email;
        res.send({ success: 'Logged in successfully' });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
    }
});

app.post('/reset-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send({ message: 'User not found' });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).send({ error: 'Password is not strong enough' });
        }

        // Compare the provided answer with the hashed one in the database
        console.log("req.body.answer:", req.body.answer);
console.log("user.securityAnswer:", user.securityAnswer);
        const isMatch = await bcrypt.compare(req.body.answer, user.securityAnswer);

        if (user.securityQuestion === req.body.question && isMatch) {
            const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
            user.password = hashedPassword;
            await user.save();
            res.send({ message: 'Password reset successfully!' });
        } else {
            res.status(400).send({ message: 'Incorrect security answer' });
        }

    } catch (error) {
        console.error(error);  // log the error for more information
        res.status(500).send({ message: 'Server error' });
    }
});


app.get('/cart-items', async (req, res) => {
    try {
        const items = await CartItem.find();
        res.json({ items });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch items', error: err.message });
    }
});

app.post('/clear-cart', async (req, res) => {
    console.log("Attempting to clear the cart...");
    try {
        await CartItem.deleteMany();
        console.log("Cart cleared successfully!");
        res.json({ success: true, message: 'Cart cleared!' });
    } catch (err) {
        console.error("Error while clearing the cart:", err);
        res.status(500).json({ success: false, message: 'Failed to clear cart', error: err.message });
    }
});

app.get('/last-logged-in', (req, res) => {
    if (lastLoggedInEmail) {
        res.json({ email: lastLoggedInEmail });
    } else {
        res.json({ message: "No user has logged in yet." });
    }
});

app.get('/get-logged-in-email', (req, res) => {
    if (lastLoggedInEmail) {
        res.json({ email: lastLoggedInEmail });
    } else {
        res.status(404).json({ message: "No user has logged in yet." });
    }
});


app.post('/add-to-cart', async (req, res) => {
    const userEmail = req.body.email;
    console.log("Incoming item to add to cart:", req.body.email);

    try {
        // Find the user by email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.log('User not found with email:', userEmail);
            return res.status(400).json({ error: 'User not found' });
        }

        console.log('user.cart before adding item to cart:', user.cart);

        // Find the item in CartItems collection by name
        const existingItem = await CartItem.findOne({ name: req.body.name });

        if (existingItem) {
            // Item exists in the cart, so update the quantity
            existingItem.quantity += 1;
            await existingItem.save();
        } else {
            // Item doesn't exist, so add as a new item to CartItems collection
            const item = new CartItem(req.body);
            await item.save();
        }

        console.log('user.cart after adding item to cart:', user.cart);

        res.json({ success: true, message: 'Item added/updated in cart!' });
    } catch (err) {
        console.error("Error adding/updating item in cart:", err.message);
        res.status(500).json({ success: false, message: 'Failed to add/update item', error: err.message });
    }
});

app.post('/place-order', async (req, res) => {
    const userEmail = req.body.email;

    try {
        // Find the user by email
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Find and fetch all items from the CartItems collection
        const cartItems = await CartItem.find();

        // Add the cart items to the user's carts array as a new order
        user.carts.push(cartItems);

        // Save the user with the updated carts
        await user.save();

        // Clear the CartItems collection
        await CartItem.deleteMany();

        res.json({ success: 'Order placed successfully' });
    } catch (err) {
        console.error("Error placing order:", err.message);
        res.status(500).json({ success: false, message: 'Failed to place order', error: err.message });
    }
});


app.post('/update-cart-item', async (req, res) => {
    const itemId = req.body.itemId;
    const newQuantity = req.body.newQuantity;

    try {
        const cartItem = await CartItem.findById(itemId);

        if (!cartItem) {
            return res.status(400).json({ error: 'Item not found' });
        }

        cartItem.quantity = newQuantity;
        await cartItem.save();

        res.json({ success: 'Item quantity updated successfully' });
    } catch (error) {
        console.error('Error updating item quantity:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update item quantity', error: error.message });
    }
});


app.get('/retrieve-current-user-data', async (req, res) => {
    const email = lastLoggedInEmail;

    if (!email) {
        return res.status(404).json({ message: 'No user is currently logged in.' });
    }

    try {
        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch the user's phone number (assuming you have a field named 'mobile' in the user schema)
        const phone = user.mobile;

        // Fetch the user's past orders from the 'carts' field
        const pastOrders = user.carts;

        res.json({
            email,
            phone,
            pastOrders, // Now correctly fetching the 'carts' field
        });
    } catch (error) {
        console.error('Error retrieving user data:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/orders', async (req, res) => {
    const email = lastLoggedInEmail;

    if (!email) {
        return res.status(404).json({ message: 'No user is currently logged in.' });
    }

    try {
        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Fetch the user's past orders from the 'carts' field
        const pastOrders = user.carts;

        res.render('orders.html', { pastOrders }); // Render the orders page with past order data
    } catch (error) {
        console.error('Error retrieving past orders:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/submit-feedback', async (req, res) => {
    const userEmail = lastLoggedInEmail;
  
    if (!userEmail) {
      return res.status(401).json({ message: 'No user is currently logged in.' });
    }
  
    const { rating, feedback } = req.body;
  
    try {
      // Create a new Feedback document in the database
      const feedbackEntry = new Feedback({
        email: userEmail,
        rating,
        feedback,
      });
  
      await feedbackEntry.save();
  
      res.json({ success: 'Feedback submitted successfully' });
    } catch (error) {
      console.error('Error submitting feedback:', error.message);
      res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
    }
  });
  
  app.get('/fetch-feedback-data', async (req, res) => {
    try {
      const feedbackData = await Feedback.find({}, 'email rating feedback'); // Retrieve email, rating, and feedback fields
      res.status(200).json(feedbackData);
    } catch (error) {
      console.error('Failed to fetch feedback data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
