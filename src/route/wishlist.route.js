
const wishList = require('../controller/wishlist.controller')

const wishlist = (app) =>{
    app.get('/api/wishlist',wishList.getAll);
    app.put('/api/wishlist',wishList.update);
    app.post('/api/wishlist',wishList.create);
    app.delete('/api/wishlist/:id',wishList.remove)
}

module.exports = wishlist