const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .populate('users')
        .populate('campsites')
        .then(favorites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        })
        .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if(favorite) {
                req.body.forEach(campsite => {
                    if(!favorite.campsites.includes(campsite._id)) {
                        favorite.campsites.push(campsite._id)
                    }
                });
                Favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            } else {
                console.log(req.user._id)
                Favorite.create({campsites: req.body, user: req.user._id})
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch((err) => next(err));
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then((favorite) => {
            if (favorite) {
                favorite.remove();
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
        })
        .catch((err) => next(err))
    });

favoriteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const campsiteId = req.params.campsiteId;
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if(favorite) {
                if(!favorite.campsites.includes(campsiteId)) {
                    favorite.campsites.push(campsiteId);
                    favorites.save()
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    });
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.send('That campsite is already a favorite!');
                }
            } else {
                Favorite.create({user: req.user._id, campsites: [campsiteId]})
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch((err) => next(err));
            }
        });
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const campsiteId = req.params.campsiteId;
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite) {
                if (favorite.campsites.includes(campsiteId)) {
                    favorite.campsite.splice(favorite.campsites.indexOf(campsiteId),1);
                    favorites.save().then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Conent-Type', 'application/json');
                        res.json(favorite);
                    });
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.json(favorite);
                }
            }
        })
    });

module.exports = favoriteRouter;