const express = require('express');
const app = express()

const { JSONLIMIT } = require('./constants');
const cookieParser = require('cookie-parser');
const path = require('path')

app.use(express.json( { limit: JSONLIMIT } ) )
app.use(express.urlencoded({extended: true, limit: JSONLIMIT}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

/**
 * Require Routes
 */
const userRouter = require('./routes/user.route')

/**
 * Use Routes
 */
app.use("/api/v1/users", userRouter)


module.exports = app;