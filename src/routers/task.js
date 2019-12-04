const Task = require('../models/task')
const express = require('express')
const auth = require('../middleware/auth')
const router = new express.Router()


//Restful API for tasks
router.post('/tasks', auth, async (req,res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth, async (req,res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'? -1:1
    }
    
    try{
        await req.user.populate({
            path:'tasks',
            match:match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort:sort
            }
        }).execPopulate()

    res.status(200).send(req.user.tasks)
    }catch(e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOne({_id: _id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    }catch(e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowed_updates = ['description','completed']
    const is_valid_operation = updates.every((update) => {return allowed_updates.includes(update)})

    if(!is_valid_operation){
        return res.status(400).send('invalid update')
    }

    const _id = req.params.id
    try{
        const task = await Task.findOne({_id:_id, owner:req.user._id})

        if(!task){
            return res.status(404).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        
        await task.save()

        res.status(200).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOneAndDelete({_id:_id, owner: req.user._id})

        if(!task){
            return res.status(404).send()
        }

        res.status(200).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router
