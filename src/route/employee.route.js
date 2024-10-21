
const emp = require('../controller/employee.controller');
const {userGuard} = require("../controller/auth.controller")

const employee = (app) =>{
    app.get('/api/employee',userGuard,emp.getList);
    app.get('/api/employee/getbyquery',emp.getOneByQuery);
    app.get('/api/employee/getbyparam/:id',emp.getOneByParam);
    app.post('/api/employee',emp.create);
    app.post('/api/employee_refresh_token',emp.refresh_token);
    app.put('/api/employee',emp.update);
    app.delete('/api/employee/:id',emp.remove);
    app.post('/api/employee_setPassword',emp.setPassword);
    app.post('/api/employe_login',emp.login)
}
module.exports = employee;