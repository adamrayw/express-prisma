const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const Joi = require('joi')
// const { createClient } = require('redis');

// const client = createClient()

// ORM
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// async function getAllNotes() {

//     const notes = await prisma.note.findMany()
//     return notes
// }


// do validation on title and content request
const schema = Joi.object().keys({
    title: Joi.string().required().messages({
        'any.title': 'Not a valid name address.',
        'any.empty': 'Year is required.',
        'any.required': 'Name dibutuhin woi!'
    }),
    content: Joi.string().required().messages({
        'any.content': 'Not a valid name address.',
        'any.empty': 'Year is required.',
        'any.required': 'Name dibutuhin woi!'
    })
})

router.get('/', (req, res) => {
    res.render('index.ejs', {
        numberOfItterations: 50
    })
})

// Get All
router.get('/notes', async (req, res) => {
    // await client.connect()
    // const value = await client.get('notes')
    // if (value) {
    //     const values = JSON.parse(value)
    //     // res.json(values)

    //     if (values.length < 2) {
    //         const parsed = JSON.parse(value)
    //         res.render('notes.ejs', { notes: parsed, user: req.user })
    //     }

    //     const parsed = JSON.parse(value)
    //     res.render('notes.ejs', { notes: parsed })
    // }
    try {
        if (req.session.passport) {
            const getAllNotes = await prisma.user.findUnique({
                where: {
                    id: req.user.id
                },
                include: {
                    notes: true
                }
            })
            // await client.set('notes', JSON.stringify(getAllNotes))
            // res.json(getAllNotes)
            res.render('notes.ejs', { notes: getAllNotes.notes, user: req.user.username })
        } else {
            res.redirect('/login')
        }
    } catch (e) {
        throw e
    }

    await prisma.$disconnect()

    // await client.disconnect()
})

// Get by id
router.get('/note/:id', async (req, res) => {
    const id = req.params.id

    // const findNote = await pool.query(`SELECT * FROM notes WHERE id=${id}`)
    const findNote = await prisma.note.findUnique({
        where: {
            id: id
        }
    })
    if (findNote === null) {
        res.status(404).render('404.ejs')
        return
    }
    await prisma.$disconnect()
    res.render("note.ejs", { findNote })
})

// Post note
router.get('/addnote', (req, res) => {

    res.render('addNote.ejs', { msg: req.flash('info') })
})

router.post('/notes', async (req, res) => {
    // await client.connect()
    const userId = req.user.id
    const title = req.body.title
    const content = req.body.content

    try {
        const { error, value } = await schema.validate({ title, content }, { abortEarly: false })
        if (!error) {
            await prisma.note.create({
                data: {
                    title: title,
                    content: content,
                    userId: userId
                }
            })
            // const getNotes = await getAllNotes()
            // await client.set('notes', JSON.stringify(getNotes))
            await prisma.$disconnect()
            res.status(201).redirect('/notes')
        } else {
            req.flash('info', {
                title: error.details[0].message.replace(/[^\w ]/g, ''),
                content: error.details[1].message.replace(/[^\w ]/g, '')
            })
            res.redirect('/addnote')
        }
    } catch (e) {
        console.log(e)
    }

    // await client.disconnect()

})

// Edit/Update note
router.get('/note/:id/edit', async (req, res) => {
    const id = req.params.id

    try {
        const getNote = await prisma.note.findUnique({
            where: {
                id: id
            }
        })

        await prisma.$disconnect()
        res.render('updateNote.ejs', { note: getNote })
    } catch (error) {

    }

})

router.post('/note/:id/edit', async (req, res) => {
    // await client.connect()
    const id = req.params.id
    const title = req.body.title
    const content = req.body.content
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var updatedAt = (new Date(Date.now() - tzoffset)).toISOString()

    try {
        const data = await prisma.note.update({
            where: {
                id: id
            },
            data: {
                title: title,
                content: content,
                updatedAt: updatedAt
            }
        })

        // get all notes again and set to redis
        // const wd = await getAllNotes()
        // await client.set('notes', JSON.stringify(wd))
        await prisma.$disconnect()
        res.redirect(`/note/${id}`)
    } catch (error) {
        throw error
    }

    // await client.disconnect()
})

// Delete note
router.post('/note/:id/delete', async (req, res) => {
    // await client.connect()
    const id = req.params.id

    try {
        await prisma.note.delete({
            where: {
                id: id
            }
        })
        // const getNotes = await getAllNotes()
        // await client.set('notes', JSON.stringify(getNotes))
        // await prisma.$disconnect()
        res.redirect('/notes')
    } catch (error) {
        throw error
    }

    // await client.disconnect()
})

module.exports = router