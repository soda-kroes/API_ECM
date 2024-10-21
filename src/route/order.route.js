
const Order = require('../controller/order.controller')

const order = (app) => {
    app.get('/api/order',Order.getAll);
    app.get('/api/order/:id',Order.getOne);
    app.post('/api/order',Order.create);
    app.post('/api/createOrder',Order.create_order)
    app.put('/api/order',Order.update);
    app.delete('/api/order/:id',Order.remove);
    app.get('/api/order',Order.getOrderByCustomer)
}
module.exports = order;