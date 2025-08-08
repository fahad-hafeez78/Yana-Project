const mongoose = require("mongoose"); 
const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const { Meal, Admin, Order, Customer, AssignMenu, Menu, MealReview } = require('../models'); 
const { uploadToS3, deleteFromS3 } = require('./s3Bucket.service');  
const { sendNotification, getVendorIdForUser } = require('../utils/helper')
const moment = require('moment-timezone');

const createMeal = async (file, body) => { 
    if (!file) throw new ApiError(status.NOT_FOUND, 'Meal image is required');

    const [vendor, mealExists] = await Promise.all([
        Admin.findById(body.vendorId)
            .populate({
                path: "user",
                select: "-password",
                populate: {
                    path: "role",
                    select: "name description permissions"
                }
            })
            .lean(),
        Meal.findOne({ name: body.name, vendorId: body.vendorId }).lean()
    ]);

    if (!vendor) throw new ApiError(status.NOT_FOUND, 'vendor not found');
    if (vendor.user.role.name !== 'vendor') throw new ApiError(status.NOT_FOUND, 'this is not vendor Id'); 
    if (mealExists) throw new ApiError(status.BAD_REQUEST, 'meal already exists with this name and vendor');

    const imageUrl = await uploadToS3(file, "meals");
    body.image = imageUrl; 

    return await Meal.create(body);
};

const allMeals = async (currentUser) => { 
    let query = {status: {$in: ["active", "inactive"]}};
    let vendorId = await getVendorIdForUser(currentUser);

    if (vendorId) {
        query.vendorId = vendorId;
    }

    const meals = await Meal.find(query)
    .populate("vendorId", "name rating");

    return meals;  
};

const vendorMeals = async (vendorId) => {  
    const meals = await Meal.find({vendorId: vendorId, status: "active"})
    .populate("vendorId", "name rating");

    return meals;  
};

const assignedWeekActiveMeals = async (vendorId) => {   

    let vendor = await Admin.findById(vendorId).populate({
        path: "user",
        select: "-password",
        populate: {
            path: "role",
            select: "name description permissions"
        }
      });
      if (!vendor) {
        throw new ApiError(status.NOT_FOUND, 'Vendor not found');
      } 
      if (vendor.user.role.name != 'vendor') {
        throw new ApiError(status.NOT_FOUND, 'Vendor not found');
      }

      if (vendor.status != 'active') {
        throw new ApiError(status.NOT_FOUND, 'Vendor is not active');
      }
    
      let assignedMenu = await AssignMenu.findOne({
        vendorId: vendorId, 
        }).populate({
            path: 'assignments.menus',
            model: 'Menu',
            populate: {
                path: 'meals',
                model: 'Meal',
                match: { 
                    status: 'active'
                }
            }
        }).lean();
    
    if (!assignedMenu) {
        throw new ApiError(status.NOT_FOUND, 'No assigned meals found');
    }

    const now = moment().tz('America/New_York');
    
    // Find active assignments
    const activeAssignments = assignedMenu.assignments.filter(assignment => 
        now.isBetween(moment(assignment.startDate).startOf('day'), moment(assignment.endDate).endOf('day'), null, '[]') 
    ); 
    
    // Collect meals from active assignments
    const activeMeals = activeAssignments.flatMap(assignment => 
        assignment.menus.flatMap(menu => menu.meals)
            .filter(meal => meal !== null) // Remove any null meals after filtering
    );

    const uniqueMealsMap = new Map();

    activeMeals.forEach(meal => {
        uniqueMealsMap.set(meal._id.toString(), meal); // Use meal _id as the key for uniqueness
    });

    const uniqueMeals = Array.from(uniqueMealsMap.values()); 
    return uniqueMeals;  
};

const customerMeals = async (user, body) => { 
    let { tags } = body; 
    let category = body.category.toLowerCase();

    if (!user.customer.vendorId) {
        throw new ApiError(status.NOT_FOUND, `your vendor is not found or not assigned`);
    }
     
    let vendor = await Admin.findById(user.customer.vendorId).populate({
        path: "user",
        select: "-password",
        populate: {
            path: "role",
            select: "name description permissions"
        }
      });
      if (!vendor) {
        throw new ApiError(status.NOT_FOUND, 'your vendor not found');
      } 
      if (vendor.user.role.name != 'vendor') {
        throw new ApiError(status.NOT_FOUND, 'your vendor not found');
      }

      if (vendor.status != 'active') {
        throw new ApiError(status.NOT_FOUND, 'your vendor is not active');
      }
    
      let assignedMenu = await AssignMenu.findOne({
        vendorId: user.customer.vendorId, 
        }).populate({
            path: 'assignments.menus',
            model: 'Menu',
            populate: {
                path: 'meals',
                model: 'Meal',
                match: {
                    ...(category && category !== 'all' && { category: category }), 
                    ...(tags && tags.length > 0 ? { tags: { $in: tags } } : {}),
                    status: 'active'
                }
            }
        }).lean();
    
    if (!assignedMenu) {
        throw new ApiError(status.NOT_FOUND, 'no assigned meals found');
    }

    const now = moment().tz('America/New_York');
    
    // Find active assignments
    const activeAssignments = assignedMenu.assignments.filter(assignment => 
        now.isBetween(moment(assignment.startDate).startOf('day'), moment(assignment.endDate).endOf('day'), null, '[]') 
    ); 
    
    // Collect meals from active assignments
    const activeMeals = activeAssignments.flatMap(assignment => 
        assignment.menus.flatMap(menu => menu.meals)
            .filter(meal => meal !== null) // Remove any null meals after filtering
    );    

    const uniqueMealsMap = new Map();

    activeMeals.forEach(meal => {
        uniqueMealsMap.set(meal._id.toString(), meal); // Use meal _id as the key for uniqueness
    });

    const uniqueMeals = Array.from(uniqueMealsMap.values());

    const mealIds = uniqueMeals.map(meal => meal._id); 
    const ratings = await MealReview.aggregate([
        { $match: { meal: { $in: mealIds } } },
        {
            $group: {
                _id: "$meal",
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

    // Map mealId -> avgRating for quick lookup
    const ratingMap = new Map(
        ratings.map(r => [r._id.toString(), r.avgRating])
    );
     
    const favoriteSet = new Set(user.customer.favorites.map(fav => fav.toString()));

    // Adding isFav tag (true/false) to each meal
    const activeMealsWithFavTag = uniqueMeals.map(meal => ({
        ...meal,
        isFav: favoriteSet.has(meal._id.toString()),
        rating: ratingMap.get(meal._id.toString()) || 0
    }));

    return activeMealsWithFavTag;  
};
 
const filterMeals = async (body) => {
    let filter = {status: {$in: ["active", "inactive"]}};

    filter.category = body.category;
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
        filter.tags ={ $in: body.tags };
    } 

    const meals = await Meal.find(filter);
    return meals;
};

const getMealById = async (id) => { 
    let meal = await Meal.findById(id)
    .populate("vendorId", "name rating")
    .lean();

    if (!meal) {
        throw new ApiError(status.NOT_FOUND, 'meal not found');
    }

    meal.reviews = await MealReview.find({ meal: id })
    .sort({createdAt: -1})
    .limit(3)
    .populate("customer", "name photo")
    .lean();

    // Get average rating
    const ratingResult = await MealReview.aggregate([
        { $match: { meal: new mongoose.Types.ObjectId(id) } },
        {
            $group: {
                _id: "$meal",
                avgRating: { $avg: "$rating" }
            }
        }
    ]);

    meal.rating = ratingResult[0]?.avgRating || 0;

    return meal;
};

const favoriteMeals = async (user) => {  
    if (!user.customer.vendorId) {
        throw new ApiError(status.NOT_FOUND, `your vendor is not found or not assigned`);
    }
     
    let vendor = await Admin.findById(user.customer.vendorId).populate({
        path: "user",
        select: "-password",
        populate: {
            path: "role",
            select: "name description permissions"
        }
      });
      if (!vendor) {
        throw new ApiError(status.NOT_FOUND, 'your vendor not found');
      } 
      if (vendor.user.role.name != 'vendor') {
        throw new ApiError(status.NOT_FOUND, 'your vendor not found');
      }

      if (vendor.status != 'active') {
        throw new ApiError(status.NOT_FOUND, 'your vendor is not active');
      }
    
      let assignedMenu = await AssignMenu.findOne({
        vendorId: user.customer.vendorId, 
        }).populate({
            path: 'assignments.menus',
            model: 'Menu',
            populate: {
                path: 'meals',
                model: 'Meal',
                match: { 
                    status: 'active'
                }
            }
        }).lean();
    
    if (!assignedMenu) {
        throw new ApiError(status.NOT_FOUND, 'no assigned meals found');
    }

    const now = moment().tz('America/New_York');
    
    // Find active assignments
    const activeAssignments = assignedMenu.assignments.filter(assignment => 
        now.isBetween(moment(assignment.startDate).startOf('day'), moment(assignment.endDate).endOf('day'), null, '[]') 
    ); 
    
    // Collect meals from active assignments
    const activeMeals = activeAssignments.flatMap(assignment => 
        assignment.menus.flatMap(menu => menu.meals)
            .filter(meal => meal !== null) // Remove any null meals after filtering
    );    

    const uniqueMealsMap = new Map();

    activeMeals.forEach(meal => {
        uniqueMealsMap.set(meal._id.toString(), meal); // Use meal _id as the key for uniqueness
    });

    const uniqueMeals = Array.from(uniqueMealsMap.values());
 
    const favoriteSet = new Set(user.customer.favorites.map(fav => fav.toString()));

    // Fetch Favorite Meals
    const favoriteMeals = uniqueMeals.filter(meal => favoriteSet.has(meal._id.toString())); 

    return favoriteMeals; 
};

const updateMealById = async (id, file, updateBody) => {
    const meal = await getMealById(id);
    if (!meal) {
      throw new ApiError(status.NOT_FOUND, 'meal not found');
    } 

    if(file){
        const imageKey = meal.image?.split(`.amazonaws.com/`)[1]; // Extract key from URL
        if (imageKey) {
          await deleteFromS3(imageKey);  
        }

        const imageUrl = await uploadToS3(file, "meals");
        updateBody.image = imageUrl;
    }

    if(updateBody.status == "inactive"){
        const orders = await Order.find({
            "meals.meal": id,
            status: { $in: ["pending", "active"] }
        });
        
        const pendingOrders = orders.filter(order => order.status === "pending");
        const activeOrders = orders.filter(order => order.status === "active");

        if (activeOrders.length > 0) {
            // return {success: false, message: "Meal found in these active orders." , data: activeOrders}; 
            throw new ApiError(status.NOT_FOUND, 'Meal exists in some active orders');
        }

        if(pendingOrders.length > 0){  
            const customerIds = [
                ...new Set(pendingOrders.map(o => o.customer.toString()))
            ];

            // Remove this meal from all pending orders
            await Order.updateMany(
                { "meals.meal": id, status: "pending" },
                { $pull: { meals: { meal: id } } }
            );

            const customers = await Customer.find({ _id: { $in: customerIds }, fcm: { $exists: true, $ne: "" } });
            if(customers.length > 0) {
                // Send push notifications to customers
                await Promise.all(
                    customers.map(async (customer) => {
                        try {
                            const title = "A Dish Has Been Removed From Your Order";
                            const body = "Unfortunately, one of your chosen meals is unavailable and has been removed. Kindly add a different meal to complete your order.";
                            const imgURL = "https://th.bing.com/th/id/OIP.EechjPY-pLkDkMm1m7Jd7QHaHa?rs=1&pid=ImgDetMain";
            
                            await sendNotification(title, body, customer.fcm, imgURL);
                            
                        } catch (error) {
                            console.error(`Failed to send notification to ${customer._id}:`, error);
                        }
                    })
                );
            }
        }
    }

    const updatedMeal = await Meal.findByIdAndUpdate(
        id,
        { $set: updateBody },
        { new: true, runValidators: true }  
    );
 
    return updatedMeal;
};

const toggleFavorite = async (user, body) => {  
  const customer = await Customer.findById(user.customer._id);
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found'); 
  }  

  // Check if the meal exists
  let meal = await Meal.findById(body.mealId);
  if (!meal) {
    throw new ApiError(status.NOT_FOUND, 'meal not found');
  }

  if(meal.status != "active"){
    throw new ApiError(status.NOT_FOUND, 'meal is not active');
  }

  const isFavorite = customer.favorites.includes(body.mealId); 
  
  if (isFavorite) { 
    customer.favorites = customer.favorites.filter(
      (favMealId) => favMealId.toString() !== body.mealId.toString()
    );
    await customer.save();
    return { message: 'Meal removed from favorites', isFav: false };
  } else { 
    customer.favorites.push(body.mealId);
    await customer.save();
    return { message: 'Meal added to favorites', isFav: true };
  }
};

const deleteMealById = async (id, currentUser) => {
    const meal = await Meal.findById(id).populate("vendorId", "name rating");
    if (!meal) {
        throw new ApiError(status.NOT_FOUND, "Meal not found");
    }

    if (meal.vendorId._id.toString() !== currentUser.admin_user._id.toString() && currentUser.role.name !== 'admin') {
        throw new ApiError(status.UNAUTHORIZED, "Only admin or vendor of this meal can delete meal");
    } 

    // Fetch both pending and active orders
    const orders = await Order.find({
        "meals.meal": id,
        status: { $in: ["pending", "active"] }
    });
    

    // Separate orders into two arrays
    const pendingOrders = orders.filter(order => order.status === "pending");
    const activeOrders = orders.filter(order => order.status === "active");

    if (activeOrders.length > 0) {
        return {success: false, message: "Meal found in these active orders." , data: activeOrders}; 
    }

    if (pendingOrders.length > 0) {    
        const customerIds = [
            ...new Set(pendingOrders.map(o => o.customer.toString()))
        ];

        // Remove this meal from all pending orders
        await Order.updateMany(
            { "meals.meal": id, status: "pending" },
            { $pull: { meals: { meal: id } } }
        );

        const customers = await Customer.find({ _id: { $in: customerIds }, fcm: { $exists: true, $ne: "" } });
        if(customers.length > 0) {
            // Send push notifications to customers
            await Promise.all(
                customers.map(async (customer) => {
                    try {
                        const title = "A Dish Has Been Removed From Your Order";
                        const body = "Unfortunately, one of your chosen meals is unavailable and has been removed. Kindly add a different meal to complete your order.";
                        const imgURL = "https://th.bing.com/th/id/OIP.EechjPY-pLkDkMm1m7Jd7QHaHa?rs=1&pid=ImgDetMain";
        
                        await sendNotification(title, body, customer.fcm, imgURL);
                        
                    } catch (error) {
                        console.error(`Failed to send notification to ${customer._id}:`, error);
                    }
                })
            );
        }
    } 
 
    await Menu.updateMany(
        { meals: id },
        { $pull: { meals: id } }
    );

    await Customer.updateMany(
        { favorites: id },
        { $pull: { favorites: id } }
      );
      
    await Meal.findByIdAndDelete(id);
    return {success: true, message: "Meal Deleted Success."}; 
};

 
module.exports = {
    createMeal,
    allMeals,
    vendorMeals,
    assignedWeekActiveMeals,
    customerMeals, 
    filterMeals,
    getMealById,
    favoriteMeals,
    updateMealById,
    toggleFavorite,
    deleteMealById
};
