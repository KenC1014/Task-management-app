const User = require('../models/user')
const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {send_welcome_email, send_cancelation_email} = require('../emails/account')

//Restful API for users
router.post('/users', async (req,res) => {
    const user = new User(req.body)

    try{
        await user.save()
        send_welcome_email(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()

    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req,res) => {
   res.send(req.user)
})


router.patch('/users/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowed_updates = ['name','email','password','age']
    const is_valid_operation = updates.every((update) => {return allowed_updates.includes(update)})
    
    if(!is_valid_operation){
        return res.status(400).send('invalid update')
    }
    const _id = req.params.id

    try{
        
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })

        await req.user.save()
        
        res.status(200).send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

router.delete('/users/me', auth, async (req,res) => {
    const _id = req.user._id

    try{
        await req.user.remove()
        send_cancelation_email(req.user.email, req.user.name)
        res.status(200).send(req.user)
        }catch(e){
        res.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(! file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 240, height:280}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res)=>{
   
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router