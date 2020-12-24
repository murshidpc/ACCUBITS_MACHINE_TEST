const userController = require('./controller/user.controller');
const authModel = require('../authorization/model/authmodel')

exports.route_config = (app) => {
    app.post('/user/signup', [
        userController.user_signup_post
    ]) 
    app.post('/user/login', [
        userController.user_login_post
    ])

    app.get('/user/list', [
        authModel.authenticateToken,
        userController.user_list_get
    ])

}