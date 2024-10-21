
const pro = require('../controller/product.controller');
const {userGuard} = require("../controller/auth.controller")
const product = (app) => {
    app.get('/api/product',pro.getListWithPagination);
    app.post('/api/product',userGuard,pro.create);
    app.put('/api/product',pro.update);
    app.delete('/api/product',pro.remove);
    app.post('/api/product/getOne',pro.getOne);
}

module.exports = product;