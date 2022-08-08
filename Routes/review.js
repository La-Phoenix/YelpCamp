const express = require('express');
const router = express.Router({ mergeParams: true });

const { reviewSchema } = require('../schemas')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')


const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressError = require('../utils/ExpressError')
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controller/review')



router.post('/', isLoggedIn, validateReview, catchAsync(reviews.updateReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview))

module.exports = router;