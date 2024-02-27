const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/bot/insights', userController.BotInsights);
router.patch('/update/keys', userController.UpdateKeys);
router.patch('/update/cron', userController.UpdateCron);
router.patch('/update/user/status', userController.UpdateUserStatus);
router.post('/bot/config/refresh', userController.RefreshBotState);
// router.get('/bot/start');
router.get('/logout', userController.Logout);
module.exports = router;
