const TelegramBot = require('node-telegram-bot-api');
const uuid = require('uuid4');
const User = require('../models/users');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment-timezone');

let job;
let bot;

let status = "Not Running"


function getTime(unixTimestamp) {
    
    const timestampInMilliseconds = unixTimestamp * 1000;
    const date = moment(timestampInMilliseconds);
    const formattedTime = date.format('hh:mm A');
    return `${formattedTime}`;
}





async function getWeather(city, country, apiKey) {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiKey}`);
    return response.data;
}

function getMessage(data, userName){
    return `
    🌍 *Weather Update for ${data.name}, ${data.sys.country}*
    
    🌡️ *Temperature*
    - Current: ${data.main.temp} K
    - Feels Like: ${data.main.feels_like} K
    - Min: ${data.main.temp_min} K
    - Max: ${data.main.temp_max} K
    
    💨 *Wind*
    - Speed: ${data.wind.speed} m/s
    - Direction: ${data.wind.deg}°
    - Gust: ${data.wind.gust} m/s
    
    ☁️ *Clouds*
    - Cloudiness: ${data.clouds.all}%
    
    🌅 *Sunrise and Sunset*
    - Sunrise: ${getTime(data.sys.sunrise)}
    - Sunset: ${getTime(data.sys.sunset)}
    
    📍 *Coordinates*
    - Longitude: ${data.coord.lon}
    - Latitude: ${data.coord.lat}
    
    🔮 *Other Details*
    - Pressure: ${data.main.pressure} hPa 
    - Humidity: ${data.main.humidity}%
    - Sea Level: ${data.main.sea_level} hPa
    - Ground Level: ${data.main.grnd_level} hPa
    - Visibility: ${data.visibility} m
    
    Stay safe and have a great day ${userName}! 🌞
    `;
}

const StopBot = () =>{
    if(job) {
        job.stop();
        status = "Not Running"
    }
}
const StartBot = (apiKey) => {

    if (!bot) bot = new TelegramBot(apiKey, { polling: true });
    else return;
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const users = await User.find({ chatId });

        if (users.length === 0) {
            bot.sendMessage(chatId, 'Welcome! Please enter your name.');
            bot.once('message', async (msg) => {
                const name = msg.text;
                bot.sendMessage(chatId, 'Please enter your city.');
                bot.once('message', async (msg) => {
                    const city = msg.text;
                    bot.sendMessage(chatId, 'Please enter your country.');
                    bot.once('message', async (msg) => {
                        const country = msg.text;
                        const newUser = new User({ _id: uuid(), chatId, name, city, country, role: 'client', status: "unblocked" });
                        await newUser.save();
                        bot.sendMessage(chatId, 'Thank you! You will now receive daily weather updates.');
                    });
                });
            });
        } else {
            const [user] = users;
            if (user.status === "unblocked")
                bot.sendMessage(user.chatId, `Hello ${user.name}, you are already subscribed for daily weather updates!`);
            else
                bot.sendMessage(user.chatId, `Hello ${user.name}, you are blocked by admin!`);
        }
    });

}

const UpdateCronJob = (cronExp, weatherApiKey) => {

    if (job) job.stop();

    job = cron.schedule(cronExp, async function () {
        try {
            const users = await User.find({ role: "client", status: "unblocked" });

            users.forEach(async (user) => {
                let weather = await getWeather(user.city, user.country, weatherApiKey);

                bot.sendMessage(user.chatId, getMessage(weather, user.name), {parse_mode: 'Markdown'});
            })
        } catch (e) {
            console.log("Error Occured during cron-job runtime. Error: ", e.message())
            throw e;
        }
    });
    status = "Running";
    job.start();
}
const Status = () => status;
module.exports = {
    StartBot,
    UpdateCronJob,
    Status,
    StopBot
}


