const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../config/keys').secretKey;
const User = require('../../models/User');

/**
 * @route POST api/users/register
 * @desc Register the user
 * @access Public
 */
router.post('/register', (req, res) => {
    let { name, username, email, password, confirm_password } = req.body;

    //Check if pw matches
    if (password !== confirm_password) {
        return res.status(400).json({
            msg: "Passwords do not match"
        });
    }

    //Check for unique username
    User.findOne({ 
        username: username 
    }).then(user => {
        if (user) {
            return res.status(400).json({
                msg: "Username already taken"
            })
        }
    });

    //Check for existing email
    User.findOne({ 
        email: email 
    }).then(user => {
        if (user) {
            return res.status(400).json({
                msg: "Email already registered, did you forget your password?"
            })
        }
    });

    // Data is valid, create new User schema
    let newUser = new User({
        name,
        username,
        email,
        password
    });

    //Hash password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save().then(user => {
                return res.status(201).json({
                    success: true,
                    msg: "User is now registered"
                });
            });
        });
    });
})

/**
 * @route POST api/users/login
 * @desc Signing in the user
 * @access Public
 */
router.post('/login', (req, res) => {
    User.findOne({ username: req.body.username })
        .then(user => {
            if (!user) {
                return res.status(400).json({
                    msg: "User not found.",
                    success: false
                })
            }
            //if there is a user, compare password
            bcrypt.compare(req.body.password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        //User's password is correct, so send JSON Token for that user
                        const payload = {
                            _id: user._id,
                            username: user.username,
                            name: user.name,
                            email: user.email
                        }
                        jwt.sign(payload, key, {
                            expiresIn: 604800
                        }, (err, token) => {
                            res.status(200).json({
                                success: true,
                                user: user,
                                token: `Bearer ${token}`,
                                msg: "You are now logged in."
                            });
                        })
                    } else {
                        return res.status(400).json({
                            msg: "Incorrect password.",
                            success: false
                        })
                    }
                })
        })
})

/**
 * @route POST api/users/profile
 * @desc Return user's data
 * @access Private
 */
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
    return res.status(200).json({
        user: req.user
    })
});

module.exports = router;