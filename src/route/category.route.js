
const cat = require('../controller/category.controller')
const {userGuard} = require("../controller/auth.controller")

const category = (app) =>{
    app.get('/api/category',userGuard,cat.getList);
    app.get('/api/category/:id',cat.getOne);
    app.post('/api/category',cat.create);
    app.put('/api/category',cat.update);
    app.delete('/api/category/:id',cat.remove);
}
module.exports = category;