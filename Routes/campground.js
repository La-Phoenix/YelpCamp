const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateCampround, isAuthor } = require('../middleware');
const campgrounds = require('../controller/campground')
const multer = require('multer');
const {storage} = require('../cloudinary')
const upload = multer({ storage })




router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampround, catchAsync(campgrounds.createForm))
    

router.get('/new', isLoggedIn, campgrounds.newForm)

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground))

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'),validateCampround, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

// router.get('/makecampground', isLoggedIn, catchAsync(async (req, res) => {
//     const camp = new Campground({ title: 'My Backyard', description: 'cheap camping' });
//     await camp.save()
//     res.send(camp)
// }))

module.exports = router;
