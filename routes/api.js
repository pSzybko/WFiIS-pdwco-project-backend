const express = require('express')
const router = express.Router()

const mailActions = require('../db/models/mail')
const userActions = require('../db/models/user')

router.post('/mail', mailActions.insertMail)
router.post('/reply', mailActions.insertReply)

router.get('/sent/:user/:sort/:type', userActions.getAllUserMailsSend)
router.get('/received/:user/:sort/:type', userActions.getAllUserMailsReceived)
router.get('/spam/:u1/:u2/:type', userActions.getSpamRecommendation)

router.get('/mail/:id', mailActions.getOneMail)
router.delete('/mail/:id', mailActions.deleteOneMail)
router.delete('/mail/:id/:user', mailActions.deleteOneMailRelation)

router.get('/users', userActions.getAllUsers)
router.post('/user', userActions.insertUser)

module.exports = router