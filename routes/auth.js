const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const router = express.Router()
const prisma = new PrismaClient()

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const checkUser = await prisma.user.findUnique({
        where: {
            email: username
        }
    })

    if (!checkUser) {
        return cb(err)
    }

    if (!checkUser) {
        return cb(null, false, {
            message: 'Incorrect username or password.'
        })
    }

    crypto.pbkdf2(password, checkUser.password, 310000, 32, 'sha512', function (err, hashedPassword) {
        if (err) {
            return cb(err)
        }

        // if (!crypto.timingSafeEqual(checkUser.password, hashedPassword)) {
        //     return cb(null, false, {
        //         message: 'Incorrect username or password'
        //     })
        // }

        return cb(null, checkUser)
    })
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

module.exports = router