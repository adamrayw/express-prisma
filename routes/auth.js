const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client');
const { route } = require('./note');
const router = express.Router()
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const checkUser = await prisma.user.findUnique({
        where: {
            email: username
        }
    })

    if (!checkUser) {
        return cb(null, false, {
            message: 'Incorrect username or password.'
        })
    }

    if (!bcrypt.compare(checkUser.password, password)) {
        return cb(null, false, {
            message: 'Incorrect username or password'
        })
    }

    return cb(null, checkUser)
}))

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

// LOGIN

router.get('/login', (req, res, next) => {
    res.render('./auth/login')
})

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/login'
}))

router.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// REGISTER

router.get('/register', (req, res) => {
    res.render('./auth/register')
})

router.post('/register', async (req, res) => {
    const username = req.body.username
    const email = req.body.email
    const password = await bcrypt.hash(req.body.password, 10);

    try {
        await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: password
            }
        })

        res.redirect('/login')
    } catch (error) {
        throw error
    }
})

module.exports = router