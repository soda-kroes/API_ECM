
const paymentMethod = require('../controller/payment_method.controller');


const payment_method = (app) => {
    app.get('/api/payment_method',paymentMethod.getAll);
    app.post('/api/payment_method',paymentMethod.create);
    app.delete('/api/payment_method/:id',paymentMethod.remove)
}
module.exports = payment_method;