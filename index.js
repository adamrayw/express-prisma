const express = require('express')
const app = express()
const pool = require('./config/db')
const noteRouter = require('./routes/note');
const authRouter = require('./routes/auth');
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(session({
    secret: 'notes',
    saveUninitialized: true,
    resave: true
}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

app.get('/', noteRouter)
app.get('/notes', noteRouter)
app.post('/notes', noteRouter)
app.get('/note/:id', noteRouter)
app.get('/note/:id/edit', noteRouter)
app.post('/note/:id/edit', noteRouter)
app.post('/note/:id/delete', noteRouter)
app.get('/addnote', noteRouter)

// auth route
app.get('/login', authRouter)
app.get('/register', authRouter)
app.post('/login/password', authRouter)
app.post('/register', authRouter)
app.post('/logout', authRouter)

app.use(express.static('public'))

app.listen(process.env.PORT || 8080, () => {
    console.log('Server connected on http://localhost:8080')
})