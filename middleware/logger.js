const logger = (req, res, next) => {

    const timeStamp = new Date().toISOString();
    const tokenInfo = req.headers.authorization || "Token Not Found";
    console.log(`[${timeStamp}] ${req.method}: ${req.url}, AccessToken: "${tokenInfo}"`);
    next();

};

module.exports = logger;