const express = require('express')
const postsRouter = require('./posts/router')

const server = express()

server.use(express.json())

server.use('/api/posts', postsRouter)

const port = 6000

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})