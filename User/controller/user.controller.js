const User=require('../models/user.model');
const authModel = require('../../authorization/model/authmodel');
const bcrypt = require('bcrypt');
const redisStore = require("../../common/redisConnection");


// user registration controller
exports.user_signup_post = async (req, res) => {
    let {name, email,password } = req.body;
    // validation (use joi)
    if (name === ''  || password === '' || email==='') {
        res.json({ status: 'error', message: 'Missing Parameter.' });
        return;
      }
    //find user with email 
    let user = await User.findOne({
        email
    });
    if (user) {
        return res.status(400).json({
            msg: "User Already Exists"
        });
    }
    // create new user
    user = new User({
        name,
        email,
        password
    });

    //encrypt password and store in db
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    //save user in db
    user.save().then(user => {
        res.status(200).json({
            msg: "User Created",
            user:user
        });
    }).catch(error => {
        res.status(400).json({
            "error": error
        });
    })

    
}

//user login controller
exports.user_login_post = async (req, res) => {
    let {email,password} = req.body;
    //validation
    if (password === '' || email==='') {
        res.json({ status: 'error', message: 'Missing Parameter.' });
        return;
      }
    // find user with email  
    let user = await User.findOne({
        email
    });
    if (!user) {
        return res.status(400).json({
            msg: "Email does not match any account."
        });
    }
    // encrypted password from db
    const passwordFromDb = user.password;
    const userId = user._id;
    // compare the passwords and create tokens
    if(bcrypt.compareSync(password, passwordFromDb)){
        const dt = new Date();
        redisStore.get(`${userId}`,function (err, reply) {
            if(JSON.parse(reply).expires > dt){
                return res.json({'status': "success", 'message': "user login done.", "Token":JSON.parse(reply).accessToken});
            }
        })
        const accessToken = await authModel.generateToken({userId});
        // And store the user in Redis under userid
        dt.setMinutes( dt.getMinutes() + 10 );
        redisStore.set(`${userId}`, JSON.stringify({
                accessToken: accessToken,
                expires: dt
            }), function (err, reply) {
                console.log(reply.toString());
            }
        );
        res.json({'status': "success", 'message': "user login done.", "Token":accessToken});
        // do token logic
    }else{
        res.json({'status': "error", 'message': "Incorrect password. Try again"});
    }
}

//list all users

exports.user_list_get = async (req, res) => {
    const { userId } = req.payLoad;
    const accessToken = await authModel.generateToken({userId});
        // And store the user in Redis under userid
        const dt = new Date();
        dt.setMinutes( dt.getMinutes() + 10 );
        redisStore.set(`${userId}`, JSON.stringify({
                accessToken: accessToken,
                expires: dt
            }), function (err, reply) {
                console.log(reply.toString());
            }
        );
    let users;
    try{
        users = await User.find();
   } catch(error){
        return res.status(400).send({"error":error})
    }
    return res.status(200).send({"users":users});
}
