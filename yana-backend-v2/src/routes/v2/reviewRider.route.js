const express = require('express');
const { reviewController } = require('../../controllers');

const router = express.Router();

router.get('/all-reviews', reviewController.getAllRiderReviews);

module.exports = router;