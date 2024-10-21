
const pos = require('../controller/pos.controller');

const POS = (app) => {
    app.get('/api/pos/master-data',pos.masterData);
}
module.exports = POS