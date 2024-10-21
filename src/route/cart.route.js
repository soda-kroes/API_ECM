
const Cart = require('../controller/cart.controller');

const cart = (app) => {
    app.get('/api/cart',Cart.getCartByCustomer);
    app.post('/api/cart',Cart.addCard);
    app.delete('/api/cart',Cart.remove);
    app.put('/api/cart',Cart.update)
} 
module.exports = cart