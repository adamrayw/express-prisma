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

    console.log(checkUser)

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

        if (!crypto.timingSafeEqual(checkUser.password, hashedPassword)) {
            return cb(null, false, {
                message: 'Incorrect username or password'
            })
        }

        return cb(null, checkUser)
    })
}))

router.get('/login', (req, res, next) => {
    res.render('./auth/login')
})

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/notes'
}))

module.exports = router