const express = require('express')
const router = express.Router()
const signUpTemplateCopy = require('../models/SignUpModels')
const bcrypt = require('bcrypt')

router.post('/signup', async (request, response) => {
    const saltPassword = await bcrypt.genSalt(10) //encrypt password before sending to DB
    const securePassword = await bcrypt.hash(request.body.password, saltPassword)

    const signedUpUser = new signUpTemplateCopy({
        fullName:request.body.fullName,
        username: request.body.username,
        email: request.body.email,
        password:securePassword
    })
    signedUpUser.save()
    .then(data => {
        response.json(data)
    })
    .catch(error => {
        response.json(error)
    })
})

//Still figuring out GET with email entry matching db...
router.get('/login/:email', (request, response) => {
    signUpTemplateCopy.findOne(request.params.email)
    .then(data => response.json(data))
    .catch(error => response.json(error))
})

module.exports = router;