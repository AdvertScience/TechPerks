const express = require('express');
const router = express.Router();
require('dotenv').config();

module.exports = async function validate(req, res, next) {
    
    const { username, keypass, password } = req.headers;

    if (!username || !keypass || !password) {
        return res.status(401).send('Unauthorized');
    }
    console.log(username, keypass, password)
    if (username !== process.env.API_USER || keypass !== process.env.API_KEY || password !== process.env.API_PASSWORD) {
        return res.status(401).send('Unauthorized');
    }
    next();
    
}