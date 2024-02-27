const jwt = require('jsonwebtoken');
const Auth = require('../models/auth.js');

const authenticate = async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; 
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {

        try {
            const authDoc = await Auth.findOne({'token': token});
            if(!authDoc.isValid) return res.status(401,).json({
                message: "Invalid token"
            });
        }catch(e){
            
            return res.status(401,).json({
                message: "Invalid token",
                error: e.message
            });

        }
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                
                return res.status(401).json({
                    message: "Invalid token"
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        
        return res.status(401).json({message:'Auth token is not provided'}) 
    }
};

module.exports = authenticate;



