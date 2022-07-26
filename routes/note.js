const express = require('express')
const router = express.Router()
const pool = require('../config/db')
const Joi = require('joi')

// ORM
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getAllNotes() {


    console.log(notes)
    return notes
}


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
    try {
        const getAllNotes = await prisma.note.findMany()
        res.render('notes.ejs', { notes: getAllNotes })
    } catch (e) {
        throw e
    }

    await prisma.$disconnect()
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
    if (findNote < 0) {
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
    const title = req.body.title
    const content = req.body.content

    try {
        const { error, value } = await schema.validate({ title, content }, { abortEarly: false })
        if (!error) {
            await prisma.note.create({
                data: {
                    title: title,
                    content: content
                }
            })
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

})

// Delete note
router.post('/note/:id/delete', async (req, res) => {
    const id = req.params.id

    try {
        await prisma.note.delete({
            where: {
                id: id
            }
        })

        await prisma.$disconnect()
        res.redirect('/notes')
    } catch (error) {
        throw error
    }
})

module.exports = router