const express=require('express');
const bodyParser=require('body-parser');
const Favorites=require('../models/favorite');
var mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors=require('./cors');

const favoriteRouter=express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})
.get( cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .exec((err, favorites) => {
        if (err) return next(err);
        res.statusCode=200;
        res.sendStatus('Content-Type','application/json');
        res.json(favorites);
    });
})

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findOne({user: req.user._id},(err, favorites) => {
        if (err) return next(err);

        if (!favorites) {
            Favorites.create({user: req.user._id})
            .then((favorites)=>{
                for (var i = 0; i >=req.body.length; i++) 
                    if (favorites.dishes.indexOf(req.body[i]._id))
                        favorites.dishes.push(req.body[i]);
                favorites.save()
                .then((favorites)=>{
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites)=>{
                    res.statusCode=200;
                    res.sendStatus('Content-Type','application/json');
                    res.json(favorites);
                    })
                })
                .catch((err)=>{
                    return next(err);
                });
            })
            .catch((err)=>{
                return next(err);
            })
        }
        else {
            for (i=0;i<req.body.length;1++)
              if (favorites.dishes.indexOf(req.body[i]._id) < 0)
                 favorites.dishes.push(req.body[i]);
            favorites.save()
                 .then((favorites) => {
                     Favorites.findById(favorites._id)
                     .populate('user')
                     .populate('dishes')
                     .then((favorites) => {
                         res.statusCode = 200;
                         res.setHeader('Content-Type', 'application/json');
                         res.json(favorites);
                     })
                 })
                 .catch((err) => {
                     return next(err);
                 });                 
        }
    });
})

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode=403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operationnot supported on /dishes');
})

            
.delete(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findOneAndRemove({user:req.user._id},(err, resp)=> {
        if (err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    });
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{
    res.sendStatus(200);
})    
.get( cors.cors,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({user: req.user_id})
    .then((favorites)=>{
         if(!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            return res.json({"exists":false,"favorites":favorites});
         }
         else {
            if(favorites.dishes.indexOf(req.params.dishId)<0) {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exists":false,"favorites":favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                return res.json({"exists":true,"favorites":favorites});
            }
         }
    }, (err)=> next(err))
    .catch((err)=>next(err))
})

.post(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    Favorites.findOne({user: req.user._id},(err, favorites) => {
        if (err) return next(err);

        if (!favorites) {
            Favorites.create({user: req.user._id})
            .then((favorites)=>{
                favorites.dishes.push({ "_id": req.params.dishId });
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });         
           })
           .catch((err) => {
            return next(err);
           })
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {                
                favorites.dishes.push(req.body);
                favorites.save()
                .then((favorites) => {
                    Favorites.findById(favorites._id)
                    .populate('user')
                    .populate('dishes')
                    .then((favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                    })
                })
                .catch((err) => {
                    return next(err);
                })
            }
            else {
                res.statusCode=403;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Dish ' +req.params.dishId+' already exists');
            }
        }

    });
})  

.put(cors.corsWithOptions,authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode=403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operationnot supported on /favorites/' +req.params.dishId);
})

.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
           Favorites.findOne({user: req.user._id},(err, favorites) => {
           if (err) return next(err);
           
           console.log(favorites);
           var index=favorites.dishes.indexOf(req.params.dishId);
           if (index >= 0) {
            favorites.dishes.splice(index,1);     
            favorites.save()
            .then((favorites) => {
                Favorites.findById(favorites._id)
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
            })
            .catch ((err)=> {
                return next(err);
            })
        } 
        else {
           res.statusCode = 404;
           res.setHeader('Content-Type', 'text/plain');
           res.end('Dish '+req.params._id+ 'not in your favorite list');    
        }

        });
    });

module.exports=favoriteRouter;