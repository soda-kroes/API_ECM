
const { userGuardWithParam } = require('../controller/auth.controller.js');
const cat = require('../controller/customer.controller.js');
const customer = (app) => {
    app.get('/api/customer',userGuardWithParam('customer.Read'),cat.getAll);
    app.post('/api/customer',userGuardWithParam('customer.Create'),cat.create);
    app.put('/api/customer',userGuardWithParam('customer.Update'),cat.update);
    app.delete('/api/customer/:id',userGuardWithParam('customer.Delete'),cat.remove);
    app.post('/api/login',cat.login)

    //address
    app.get('/api/customer_address',cat.listAddress)
    app.get('/api/customer_address/:id',cat.listOneAddress)
    app.post('/api/customer_address',cat.newAddress)
    app.put('/api/customer_address',cat.updateAddress)
    app.delete('/api/customer_address/:id',cat.deleteAddress)
}
module.exports = customer;