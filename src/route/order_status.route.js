
const orderStatus = require('../controller/order_status.controller');


const order_status = (app) => {
    app.get('/api/order_status',orderStatus.getAll);
    app.post('/api/order_status',orderStatus.create);
    app.delete('/api/order_status/:id',orderStatus.remove)

}
module.exports = order_status
