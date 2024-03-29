const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const UserModel = require('../models/user');
const gameModel = require('../models/game');
const findUser = require('../dbActions/findUser');
const bcrypt = require('bcrypt');
const validator = require('validator');
const rateLimiters = require('../utils/rateLimiters');

const gameManager = require('../chess/gameManager');

router.post('/signup', async (request, response, next) => {
  // encrypt password before sending to DB
  const saltPassword = await bcrypt.genSalt(10);
  const securePassword = await bcrypt.hash(request.body.password, saltPassword);

  const fullName = request.body.fullName;
  const username = request.body.username;
  const email = validator.normalizeEmail(request.body.email);
  // Sanitize input then store in DB.
  try {
    if (
      !validator.isAlphanumeric(fullName) ||
            !validator.isAlphanumeric(username) ||
            !validator.isEmail(email) ||
            request.body.password.length < 8
    ) {
      throw new Error('Data validation failed!');
    }

    const userData = await findUser(email);
    if (userData) {
      response.json({
        message: 'Account already exists',
        success: false,
      });
      return next();
    }

    // Saved into DB
    const signedUpUser = new UserModel({
      fullName,
      username,
      email,
      password: securePassword,
    });

    await signedUpUser.save();

    response.json({
      username: request.body.username,
      email: request.body.email,
      message: 'Successfully signed up',
      success: true,
    });
  } catch (error) {
    response.json({
      message: 'Data validation failed.',
      success: false,
    });
    console.log(error);
    return next();
  }
  return next();
});

router.post('/login', async (request, response, next) => {
  let email = request.body.email;
  const password = request.body.password;
  // Sanitize, then search for user
  try {
    if (!validator.isEmail(email)) {
      throw new Error('Invalid email');
    }
    email = validator.normalizeEmail(email);

    if (await rateLimiters.isLoginLocked(request.ip, email)) {
      response.status(429).json({
        message: 'Failed to log in',
        success: false,
      });
      return;
    }
    const userData = await findUser(email);

    // Check email
    if (!userData) {
      throw new Error('Invalid email');
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      throw new Error('Invalid password');
    }

    // TODO: Session tokens to more reliably check authentication

    // Send back to user
    const body = {
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      success: true,
      message: 'Successfully logged in.',
    };

    response.json(body);
  } catch (error) {
    // Count on rate limiter.
    rateLimiters.failedLoginAttempt(request.ip, email);
    response.json({
      message: 'Failed to log in',
      success: false,
    });
    return;
  }

  // Reset consecutive fails on successful authentication
  rateLimiters.successfulLogin(request.ip, email);

  return next();
});

router.post('/profile', async (request, response, next) => {
  const InputEmail = request.body.email;

  try {
    const userData = await findUser(InputEmail);

    // Check email
    if (!userData) {
      console.log('invalid email');
      response.json(false);
      return next();
    }

    // Send back to user
    const body = {
      elo: userData.elo,
      id: userData._id,
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      success: true,
      message: 'Successfully received profile data.',
    };

    response.json(body);
  } catch (error) {
    console.log(error);
  }
});

router.post('/history', async (request, response) => {
  const user = request.body.username;
  const games = await
  gameModel.find({$or: [{black: user}, {white: user}]}).exec();

  response.json(games);
});

router.post('/leaderboard', async (request, response) => {
  const users = await UserModel.find({elo: {$gt: 0}}).exec();
  response.json(users);
});
router.post('/spectate', async (request, response) => {
  response.json({
    success: true,
    message: 'Retrieved games',
    games: gameManager.getActiveGames(),
  });
});

module.exports = router;
