
const add = require('../controller/address.controller');

const address = (app) => {
    app.get('/api/get-province',add.getAllProvince);
} 
module.exports = address