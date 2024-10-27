var express = require('express');
var router = express.Router();
var validate = require('../../helpers/validate');

router.post('/api/ping', validate, (req, res) => {
    // You can access the request body via req.body
    console.log('Received a ping:', req.body);

    // Send a response back
    res.json({ message: 'pong' });


});

module.exports = router;