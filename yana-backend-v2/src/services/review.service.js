const { status } = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { MealReview, SupportRiderReview, Meal, Customer } = require('../models');  
const { getVendorIdForUser } = require('../utils/helper');


const customerCreateMealReview = async (currentUser, body) => { 
  const { reviews, orderId } = body;

  // check if customer already reviewed this order
  const existingReviews = await MealReview.find({ 
    customer: currentUser.customer._id, 
    order: orderId 
  });
  if (existingReviews.length > 0) {
    throw new ApiError(status.BAD_REQUEST, 'You have already reviewed this order');
  }

  reviews.forEach(review => {
    review.customer = currentUser.customer._id;  
    review.order = orderId;
  });
  
  return await MealReview.insertMany(reviews);
};

const customerCreateSupportRiderReview = async (currentUser, body) => { 

  // check if customer already reviewed on the rider
  if(body.rider && mongoose.Types.ObjectId.isValid(body.rider)) {
    const existingReviews = await SupportRiderReview.find({
      customer: currentUser.customer._id,
      order: body.order,
      rider: body.rider
    });
    if (existingReviews.length > 0) {
      throw new ApiError(status.BAD_REQUEST, 'You have already reviewed this rider');
    }
  }

  body.customer = currentUser.customer._id;
  if (body.rider === '') {
    body.rider = null;
  }
  return await SupportRiderReview.create(body);
};
  
const allReviews = async (user) => { 
    let query = {};
    let vendorId = await getVendorIdForUser(user);

    if (vendorId) { 
      const meals = await Meal.find({vendorId: vendorId});
      let mealIdsArray = meals.map(meal => meal._id);
      query.meal = { $in: mealIdsArray }; 
   } 

    const meal_reviews = await MealReview.find(query)
    .populate("customer", "name phone photo")
    .populate({
      path: "meal",
      select: "name image vendorId",
      populate: {
        path: "vendorId",
        select: "name photo address"
      }
    });

    const support_reviews = await SupportRiderReview.find({ 
      $or: [
        { rider: { $exists: false } },
        { rider: null },
        { rider: { $not: { $type: "objectId" } } }
      ]
    }).populate("customer", "name phone photo");

    const rider_reviews = await SupportRiderReview.find({ 
      rider: { $type: "objectId" }
    })
    .populate("customer", "name phone photo");
    // .populate("rider", "name phone photo");

    return { meal_reviews, support_reviews, rider_reviews };
};

const customersList = async (currentUser) => {

  // 1. Get latest meal review date per customer
  const mealReviewDates = await MealReview.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$customer",
        latestMealReviewDate: { $first: "$createdAt" }
      }
    }
  ]);

  // 2. Get latest support/rider review date per customer
  const supportReviewDates = await SupportRiderReview.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$customer",
        latestSupportReviewDate: { $first: "$createdAt" }
      }
    }
  ]);

  // 3. Merge both review types by customerId and keep latest date
  const reviewDateMap = new Map();

  // Add meal reviews
  for (const item of mealReviewDates) {
    reviewDateMap.set(item._id.toString(), item.latestMealReviewDate);
  }

  // Add support/rider reviews
  for (const item of supportReviewDates) {
    const customerId = item._id.toString();
    const existingDate = reviewDateMap.get(customerId);
    if (!existingDate || item.latestSupportReviewDate > existingDate) {
      reviewDateMap.set(customerId, item.latestSupportReviewDate);
    }
  }

  const uniqueCustomerIds = [...reviewDateMap.keys()];
  const uniqueCustomerObjectIds = uniqueCustomerIds.map(id => new mongoose.Types.ObjectId(id));
 
  
  const matchStage = [];

  matchStage.push({ 
    $lookup: {
      from: 'admins',
      localField: 'vendorId',
      foreignField: '_id',
      as: 'vendorId',
    }, 
  });
 
  matchStage.push({
    $unwind: { 
      path: '$vendorId',
      preserveNullAndEmptyArrays: true, 
    }
  });
  
 
  let vendorId = await getVendorIdForUser(currentUser);
  if (!vendorId) {
    matchStage.push({
      $match: {  
        _id: { $in: uniqueCustomerObjectIds }
      },
    }); 
  } else {
    matchStage.push({
      $match: { 
        "vendorId._id": vendorId,
        _id: { $in: uniqueCustomerObjectIds }
      },
    });
  }

   matchStage.push({
    $project: {
      _id: 1, 
      customer_id: 1, 
      name: 1, 
      photo: 1,   
      vendorId: { _id: 1, vendor_id: 1, name: 1, photo: 1 }
    },
  });
 
  const customers = await Customer.aggregate(matchStage);  

  // 5. Attach latest review date and sort by it
  const customersWithReviewDates = customers.map(c => {
    const reviewDate = reviewDateMap.get(c._id.toString());
    return {
      ...c,
      latestReviewDate: reviewDate
    };
  });

    // Sort customers by latestReviewDate descending
  customersWithReviewDates.sort((a, b) => new Date(b.latestReviewDate) - new Date(a.latestReviewDate));

  return customersWithReviewDates; 
};

const customerAllReviews = async (currentUser) => {
 
    const meal_reviews = await MealReview.find({customer: currentUser.customer._id})
    .populate("customer", "name phone photo")
    .populate({
        path: "meal",
        select: "name image vendorId",
        populate: {
            path: "vendorId",
            select: "name photo address"
        }
    });

    const support_reviews = await SupportRiderReview.find({
      customer: currentUser.customer._id,
      $or: [
        { rider: { $exists: false } },
        { rider: null },
        { rider: { $not: { $type: "objectId" } } }
      ]
    }).populate("customer", "name phone photo");

    const rider_reviews = await SupportRiderReview.find({
      customer: currentUser.customer._id,
      rider: { $type: "objectId" }
    })
    .populate("customer", "name phone photo");
    // .populate("rider", "name phone photo");

    return { meal_reviews, support_reviews, rider_reviews };
};
  
const getReviewById = async (id, type) => { 
  if (type == "meal") {
    let review = await MealReview.findById(id)
    .populate("customer", "name phone photo")
    .populate({
        path: "meal",
        select: "name image vendorId",
        populate: {
        path: "vendorId",
        select: "name photo address"
        }
    });

    if (!review) {
      throw new ApiError(status.NOT_FOUND, 'review not found');
    } 
    return review;
  } else if (type == "support-rider") {
    const review = await SupportRiderReview.findById(id)
    .populate("customer", "name phone photo");
    // .populate("rider", "name phone photo");

    if (!review) {
      throw new ApiError(status.NOT_FOUND, 'review not found');
    } 
    return review;
  } else {
    throw new ApiError(status.BAD_REQUEST, 'Invalid review type');
  } 
};

const getReviewsByCustomerId = async (customerId) => {
  // customer exists check
  const customer = await Customer.findById(customerId).populate("vendorId", "name photo").lean();
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'Customer not found');
  }

  const meal_reviews_raw = await MealReview.find({customer: customerId}) 
    .populate({
        path: "meal",
        select: "name image vendorId",
        populate: {
            path: "vendorId",
            select: "name photo address"
        }
    });

    const support_reviews_raw = await SupportRiderReview.find({
      customer: customerId,
      $or: [
        { support_rating: { $exists: true, $nin: [null, 0] } },
        { support_text: { $exists: true, $nin: [null, ''] } }
      ] 
    });

    const rider_reviews_raw = await SupportRiderReview.find({
      customer: customerId,
      rider: { $type: "objectId" },
      $or: [
        { rider_rating: { $exists: true, $nin: [null, 0] } },
        { rider_text: { $exists: true, $nin: [null, ''] } }
      ] 
    }).populate("rider", "rider_id name phone photo");

    // Normalize meal reviews
    const meal_reviews = meal_reviews_raw.map(review => ({
      name: review.meal?.name || "Unknown Meal",
      photo: review.meal?.image || "",
      rating: review.rating || null,
      review_text: review.reviewText || "",
      createdAt: review.createdAt || ""
    }));

    // Normalize support reviews
    const support_reviews = support_reviews_raw.map(review => ({
      name: "Support",
      photo: "", // No photo for support
      rating: review.support_rating || null,
      review_text: review.support_text || "",
      createdAt: review.createdAt || ""
    }));

    // Normalize rider reviews
    const rider_reviews = rider_reviews_raw.map(review => ({
      rider_id: review.rider?.rider_id || "Rider ID Missing",
      name: review.rider?.name || "Unknown Rider",
      photo: review.rider?.photo || "",
      rating: review.rider_rating || null,
      review_text: review.rider_text || "",
      createdAt: review.createdAt || ""
    }));

    return { customer, meal_reviews, support_reviews, rider_reviews };
};

const getReviewsByMealId = async (mealId) => {

    const stats = await MealReview.aggregate([
        { $match: { meal: new mongoose.Types.ObjectId(mealId) } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: "$count" },
            totalScore: {
              $sum: {
                $multiply: ["$_id", "$count"]
              }
            },
            ratingsCount: {
              $push: {
                rating: "$_id",
                count: "$count"
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            avgRating: {
              $cond: [
                { $eq: ["$totalReviews", 0] },
                0,
                { $divide: ["$totalScore", "$totalReviews"] }
              ]
            },
            ratingsCount: {
              $arrayToObject: {
                $map: {
                  input: "$ratingsCount",
                  as: "item",
                  in: {
                    k: { $toString: "$$item.rating" },
                    v: "$$item.count"
                  }
                }
              }
            }
          }
        }
    ]);
     
    const ratingStats = stats[0] || {
        avgRating: 0,
        ratingsCount: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
    };


  const reviews = await MealReview.find({ meal: mealId })
    .populate("customer", "name phone photo")
    .populate({ 
        path: "meal",
        select: "name image vendorId",
        populate: {
        path: "vendorId",
        select: "name photo address"
        }
    });

   
    return {
        stats: {
          average: ratingStats.avgRating.toFixed(1),
          counts: {
            "1": ratingStats.ratingsCount["1"] || 0,
            "2": ratingStats.ratingsCount["2"] || 0,
            "3": ratingStats.ratingsCount["3"] || 0,
            "4": ratingStats.ratingsCount["4"] || 0,
            "5": ratingStats.ratingsCount["5"] || 0,
          }
        },
        reviews
    };
};

const updateReviewById = async (id, updateBody) => {
    const review = await getReviewById(id, updateBody.type);
    if (!review) {
      throw new ApiError(status.NOT_FOUND, 'review not found');
    } 

    if (updateBody.type == "meal") {
      const updatedReview = await MealReview.findByIdAndUpdate(
          id,
          { $set: updateBody },
          { new: true, runValidators: true }  
      );
  
      return updatedReview;
    } else if (updateBody.type == "support-rider") {
      const updatedReview = await SupportRiderReview.findByIdAndUpdate(
          id,
          { $set: updateBody },
          { new: true, runValidators: true }  
      );
  
      return updatedReview;
    } else {
      throw new ApiError(status.BAD_REQUEST, 'Invalid review type');
    }
};

const deleteReviewById = async (id, type) => { 
    if (type == "meal") { 
      const review = await getReviewById(id, type);
      if (!review) {
        throw new ApiError(status.NOT_FOUND, 'review not found');
      }
      await MealReview.findByIdAndDelete(id);
      return;
    } else if (type == "support-rider") { 
      const review = await getReviewById(id, type);
      if (!review) {
        throw new ApiError(status.NOT_FOUND, 'review not found');
      }
      await SupportRiderReview.findByIdAndDelete(id);
      return;
    } else {
      throw new ApiError(status.BAD_REQUEST, 'Invalid review type');
    } 
};

const getAllRiderReviews = async (currentUser) => {
  const reviews = await SupportRiderReview.find({ rider: currentUser.rider._id })
      .select('-support_rating -support_text')  
      .populate('customer', 'name phone photo')  
      .populate('order', 'order_id meals phone')  
      .lean();  

  return reviews;
};

module.exports = {
    customerCreateMealReview, 
    customerCreateSupportRiderReview,
    allReviews,
    customerAllReviews, 
    customersList,
    getReviewById,
    updateReviewById,
    deleteReviewById,
    getReviewsByMealId,
    getReviewsByCustomerId,
    getAllRiderReviews
};
