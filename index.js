const express = require('express')
const app = express()
const pool = require('./config/db')
const noteRouter = require('./routes/note');
const flash = require('connect-flash')
const session = require('express-session')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(session({
    secret: 'notes',
    saveUninitialized: true,
    resave: true
}))
app.use(flash())

app.get('/', noteRouter)
app.get('/notes', noteRouter)
app.post('/notes', noteRouter)
app.get('/note/:id', noteRouter)
app.post('/note/:id/delete', noteRouter)
app.get('/addnote', noteRouter)

app.use(express.static('public'))

app.listen(process.env.PORT || 8080, () => {
    console.log('Server connected on http://localhost:8080')
})