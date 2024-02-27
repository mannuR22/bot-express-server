const User = require('../models/users');
const Auth = require('../models/auth');
const Bot = require('../models/bot');
const cron = require('node-cron');
const BotUtils = require('../utils/bot')

const botConfigCompleted = (botInfo) => {
    if (botInfo.cronExp && botInfo.apiKeys && botInfo.apiKeys.bot && botInfo.apiKeys.weather)
        return true;

    return false;
}

const BotInsights = async (req, res) => {

    let resBody, code;

    try {

        const botSettings = await Bot.find();

        if (botSettings.length === 1) {
            const [botSetting] = botSettings;

            resBody = {
                apiKeys: botSetting.apiKeys,
                cronExp: botSetting.cronExp,
                updatedOn: botSetting.updatedAt,
                isBotConfigDone: botConfigCompleted(botSetting),
                botStatus: BotUtils.Status()
            }

            const users = await User.find({ role: "client" });
            let blockedUsers = [], unblockedUsers = [];
            users.forEach((user) => {
                if (user.status === "blocked") {
                    blockedUsers.push({
                        id: user._id,
                        name: user.name,
                    })
                } else {
                    unblockedUsers.push({
                        id: user._id,
                        name: user.name,
                    })
                }
            })

            code = 200;
            resBody.users = {
                blocked: blockedUsers,
                unblocked: unblockedUsers
            };
        } else {
            code = 409;
            resBody = { message: "Bot setting document doesnt exist in db." }
        }
    } catch (e) {
        code = 500;
        resBody = {
            message: "An error occured."
        }
    }

    res.status(code).json(resBody)
}

const UpdateKeys = async (req, res) => {
    let resBody, code;
    let { bot, weather } = req.body;
    console.log("Hello")
    if (bot || weather) {
        try {
            const botSettings = await Bot.find();

            if (botSettings.length === 1) {
                let [botSetting] = botSettings;

                if (bot) botSetting.apiKeys.bot = bot;
                if (weather) botSetting.apiKeys.weather = weather;

                botSetting.save();
                code = 200;
                resBody = {
                    message: "Key(s) updated successfully."
                };
            } else {
                code = 409;
                resBody = { message: "Bot setting document doesnt exist in db. " }
            }
        } catch (e) {
            code = 500;
            resBody = {
                message: "An error occured.",
                error: e.message,
            };
        }
    } else {
        code = 400
        resBody = { message: 'Either bot or weather field required.' }
    }

    res.status(code).json(resBody)

}

const UpdateCron = async (req, res) => {
    const { cronExp } = req.body;
    let code, resBody;

    if (cronExp && cron.validate(cronExp)) {
        try {
            const botSettings = await Bot.find();

            if (botSettings.length === 1) {
                const [botSetting] = botSettings;

                botSetting.cronExp = cronExp;

                botSetting.save();

                code = 200;
                resBody = {
                    message: "Cron-expression updated successfully."
                }

            } else {
                code = 409;
                resBody = { message: "Bot setting document doesnt exist in db. " }
            }
        } catch (e) {
            code = 500;
            resBody = {
                message: "An Error Occured.",
                error: error.message
            };
        }
    } else {
        code = 409;
        resBody = { message: "Invalid CRON Expression" }
    }

    res.status(code).json(resBody)

}

const UpdateUserStatus = async (req, res) => {
    const { userId, status } = req.body;
    let code, resBody;

    if (userId && status && (status === 'blocked' || status === 'unblocked')) {
        try {
            const userDocs = await User.find({ _id: userId });

            if (userDocs.length === 1) {
                let [userDoc] = userDocs;
                userDoc.status = status
                userDoc.save();
            }

            code = 200;
            resBody = {
                message: "User status updated successfully."
            };
        } catch (e) {
            code = 500;
            resBody = {
                message: "An Error Occured.",
                error: error.message
            }
        }
    } else {
        code = 409;
        resBody = {
            message: "Make sure userId & status field exist.(allowed value for status field 'blocked' & 'unblocked')"
        }
    }
    res.status(code).json(resBody)
}

const RefreshBotState = async (req, res) => {
    
    let {enable} = req.body;
    let code, resBody;

    if( req.body.hasOwnProperty("enable") && typeof req.body.enable === 'boolean'){
        try {
            const botSettings = await Bot.find();
    
            if (botSettings.length === 1) {
                let [botSetting] = botSettings;
    
    
                if (botConfigCompleted(botSetting)) {

                    if(enable){
                        BotUtils.StartBot(botSetting.apiKeys.bot);
                        BotUtils.UpdateCronJob(botSetting.cronExp, botSetting.apiKeys.weather);
                        resBody = {
                            message: "Bot stared with new configuration."
                        }
                    }else {
                        BotUtils.StopBot();
                        resBody = {
                            message: "Bot stopped successfully."
                        }
                    }
                    
    
                    code = 200;
                    
    
                }else{
                    code = 409;
                    resBody = { message: "Please Complete bot configuration i.e. apiKeys & cron-expression is updated in system." }
                }
    
    
    
            } else {
                code = 409;
                resBody = { message: "Bot setting document doesnt exist in db. " }
            }
        } catch (e) {
            code = 500;
            console.log(e)
            resBody = {
                message: "An error occured.",
                error: e.message,
            };
        }
    } else {
        code = 409;
        resBody = {
            message: "Make sure request body contains enable field with boolean type only."
        }
    }

    res.status(code).json(resBody)


}
const Logout = async (req, res) => {


    let code, resBody;
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token) {
        try {
            await Auth.findOneAndUpdate({ 'token': token }, { isValid: false });
            code = 200;
            resBody = {
                message: "User logout success."
            };
        } catch (e) {
            code = 409;
            resBody = {
                message: "Error Occured while feteching authDoc from auths collection.",
                error: e.message
            }
        }
    }

    res.status(code).json(resBody);

}


module.exports = {
    BotInsights,
    UpdateKeys,
    UpdateCron,
    UpdateUserStatus,
    RefreshBotState,
    Logout
};
