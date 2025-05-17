const express = require('express');
const router = express.Router();
const Category = require('../models/game-categories');

router.get('/', (req, res) => {
     const io = req.app.get('io');
    Category.fetchCategories((err, result) => {
        if(err) {
            res.json({success: false, msg: 'Categories Failed'});
        } else {
            // io.emit('newTaskAdded',{
            //     msg: 'am I working?'
            // }); see d error here
            res.json(result);
            // console.log(result);
        }
    });
});

module.exports = router;