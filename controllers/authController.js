const jwt = require('jsonwebtoken');
const User = require('../models/users');
const bcrypt = require('../utils/bcrypt');
const uuid = require('uuid4');
const Auth = require('../models/auth');
const Bot = require('../models/bot');

const Register = async (req, res) => {

    const { name, password } = req.body;
    let code, resBody;
    if (!name || !password) {
        code = 400;
        resBody = {
            message: 'All fields are required'
        };
    } else {
        try {
            const user = new User();
            const userDoc = await User.find({ 'name': name });
            if (userDoc.length > 0) {
                code = 409;
                resBody = { message: "name already exist." };
            } else {
                user._id = uuid();
                user.name = name;
                user.password = bcrypt.encrypt(password);
                user.role = "admin";
                user.save();
                const botSettings = await Bot.find();
                if (botSettings.length === 0) {
                    const bot = new Bot();
                    bot._id = uuid();
                    bot.enabled = false;
                    await bot.save();
                }


                code = 201;
                resBody = {
                    message: "User created Successfully.",
                    userInfo: {
                        name: user.name,
                    }
                };

            }

        } catch (e) {
            code = 500;
            resBody = {
                message: "An error has occured.",
                error: e.message,
            };
        }
    }

    res.status(code).json(resBody);

};

const Login = async (req, res) => {

    const { name, password } = req.body;
    let code, resBody;
    if (!name || !password) {
        code = 400
        resBody = { message: 'username and password required.' }
    } else {
        try {

            const userDocs = await User.find({ 'name': name });

            if (userDocs.length === 1) {
                const [userDoc] = userDocs;
                if (bcrypt.validate(password, userDoc.password)) {

                    const token = jwt.sign(
                        {
                            userId: userDoc._id
                        },
                        process.env.SECRET,
                        {
                            expiresIn: "12h"
                        }
                    );
                    //creating auth doc in mongo
                    const auth = new Auth();
                    auth._id = uuid();
                    auth.token = token;
                    auth.isValid = true;
                    auth.userId = userDoc._id;
                    auth.save();

                    code = 200;
                    resBody = {
                        message: "Auth successful",
                        token: token
                    };

                } else {
                
                    code = 401;
                    resBody = {
                        message: "Incorrect password!"
                    };
                }
            } else {
                code = 409;
                resBody = {
                    message: "User doesn't exist with name.",
                    error: e.message,
                };
            }

        } catch (e) {

            code = 500;
            resBody = {
                message: "An error occured.",
                error: e.message,
            };
        }
    }

    res.status(code).json(resBody);


};



module.exports = {
    Register,
    Login
};
