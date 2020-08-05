const express = require("express")

const router = express.Router()

const db = require('../data/db')
const { findById, insertComment, findCommentById, remove, update } = require("../data/db")

//get all posts
router.get('/', (req, res) => {
    db.find()
        .then(posts => {
            res.status(200).json(posts)
        })
        .catch(err => {
            res.status(500).json({error: 'The posts information could not be retrieved.'})
        })
})

// get posts by id
router.get('/:id', (req, res) => {
    console.log(req.params.id)
    db.findById(req.params.id)
        .then(post => {
            if (post.length > 0) {
                return (res.status(200).json(post))
            } else {
                return(res.status(404).json({message: 'The post with the specified ID does not exist'}))
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({error: 'The post information could not be retrieved'})
        })
})

// get comments for a post
router.get('/:id/comments', (req, res) => {
    db.findPostComments(req.params.id)
        .then(comments => {
            console.log(comments)
            if (comments.length > 0) {
                return (res.status(200).json(comments))
            } else {
                return(res.status(404).json({message: 'The post with the specified ID does not exist'}))
            }
        })
        .catch(err => {
            console.log(err)
            return(res.status(500).json({error: 'The post information could not be retrieved'}))
        })
})

// post a post to the database
router.post('/', (req, res) => {
    console.log(req.body)
    if (req.body.title && req.body.contents) {
        db.insert(req.body)
            .then(postId => {
                console.log(postId)
                findById(postId.id)
                    .then(post => {
                        console.log(post)
                        return(res.status(201).json(post))
                    })
                    .catch(err => {
                        return(res.status(500).json({error: 'There was an error while saving the post to the database'}))
                    })
            })
            .catch(err => {
                return(res.status(500).json({error: 'There was an error while saving the post to the database'}))
            })
    } else {
        return(res.status(400).json({error: 'Please provide a title and content for the post'}))
    }
})

// post a comment to a post
router.post('/:id/comments', (req, res) => {
    if (req.body.text) {
        const newComment = {
            text: req.body.text,
            post_id: req.params.id
        }
        findById(req.params.id)
            .then(post => {
                if (post.length > 0) {
                    insertComment(newComment)
                        .then(commentId => {
                            // console.log(commentId)
                            findCommentById(commentId.id)
                                .then(comment => {
                                    return(res.status(200).json(comment))
                                })
                                .catch(err => {
                                    return(res.status(500).json({error: 'There was an error while saving the comment to the database'}))
                                })
                        })
                        .catch(err => {
                            return(res.status(500).json({error: 'There was an error while saving the comment to the database'}))
                        })
                } else {
                    return(res.status(404).json({error: 'The post with the specified id does not exist.'}))
                }
            })
            .catch(err => {
                return(res.status(404).json({message: 'The post with the specified ID does not exist.'}))
            })
    } else {
        return(res.status(400).json({errorMessage: 'Please provide text for the comment.'}))
    }
})

// delete a post
router.delete('/:id', (req, res) => {
findById(req.params.id)
    .then(post => {
        const toDelete = post
        if (post.length > 0){
            remove(req.params.id)
                .then(post => {
                    console.log(post)
                    return(res.status(200).json(toDelete))
                })
                .catch(err => {
                    return(res.status(500).json({error: 'The post could not be removed'}))
                })
        } else {
            return(res.status(404).json({error: 'The post with the specified ID does not exist'}))
        }
    })
    .catch(err => {
        return(res.status(404).json('The post with the specified ID does not exist'))
    })
})

// PUT - update a post
router.put('/:id', (req, res) => {
    findById(req.params.id)
        .then(post => {
            if (post.length > 0) {
                if (req.body.title && req.body.contents) {
                    const updatedPost = {
                        title: req.body.title,
                        contents: req.body.contents
                    }
                    update(req.params.id, updatedPost)
                        .then(postId => {
                            console.log(postId)
                            findById(postId)
                                .then(post => {
                                    if (post.length > 0) {
                                        return(res.status(200).json(post))
                                    } else {
                                        return(res.status(404).json({errorMessage: 'The post with the specified ID does not exist'}))
                                    }
                                })
                                .catch(err => {
                                    res.status(500).json({errorMessage: 'The post information could not be modified'})
                                })
                        })
                        .catch(err => {
                            res.status(500).json({errorMessage: "There was an error updating the post"})
                        })
                } else {
                    res.status(400).json({errorMessage: "Please provide title and contents for the post"})
                }
            } else {
                return(res.status(404).json({errorMessage: 'The post with the specified ID does not exist'}))
            }
        })
        .catch(err => {
            res.status(404).json({errorMessage: 'The post with the specified ID does not exist'})
        })
})

module.exports = router