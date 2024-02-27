const jwt = require('jsonwebtoken');
const Auth = require('../models/auth.js');

const authMiddleware = async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; 
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {
        let isValid = false;
        try {
            const authDoc = await Auth.findOne({'token': token});
            isValid = authDoc.isValid;
        }catch(e){
        }

        if(isValid){
            jwt.verify(token, process.env.SECRET, (err, decoded) => {
                if (!err) {
                    req.decoded = decoded;
                }
            });
        }
        
    }

    next();
};

module.exports  = authMiddleware;
