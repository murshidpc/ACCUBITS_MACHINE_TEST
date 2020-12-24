const jwt = require('jsonwebtoken');

// Generate Token
exports.generateToken = async (payLoad) => {
  console.log(payLoad);
    const token = await jwt.sign(payLoad, process.env.JWT_SECRET,{expiresIn:'1h'});
    return token;
  };

// authenticate JWT Token Middleware
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      return jwt.verify(token, process.env.JWT_SECRET, (err, payLoad) => {
        if (err) {
          res.send(err);
          return;
        } else {     
          req.payLoad = payLoad;
          next()
        }
      });
    } else {
      return res.sendStatus(401);
    }
  };

