const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { mealService } = require('../services');

const createMeal = catchAsync(async (req, res) => {
    const meal = await mealService.createMeal(req.file, req.body);
    res.status(status.CREATED).send({ success: true, message: "Meal Created Successfully.", meal });
});
  
const allMeals = catchAsync(async (req, res) => { 
    const meals = await mealService.allMeals(req.user);
    res.status(status.OK).send({ success: true, message: "Meals Fetched Successfully.", meals });
});

const vendorMeals = catchAsync(async (req, res) => { 
    const meals = await mealService.vendorMeals(req.params.vendorId);
    res.status(status.OK).send({ success: true, message: "Vendor Meals Fetched Successfully.", meals });
});

const assignedWeekActiveMeals = catchAsync(async (req, res) => { 
    const meals = await mealService.assignedWeekActiveMeals(req.params.vendorId);
    res.status(status.OK).send({ success: true, message: "Vendor Meals Fetched Successfully.", meals });
});

const customerMeals = catchAsync(async (req, res) => { 
    const meals = await mealService.customerMeals(req.user, req.body);
    res.status(status.OK).send({ success: true, message: "Meals Fetched Successfully.", meals });
});
 
const filterMeals = catchAsync(async (req, res) => { 
    const meals = await mealService.filterMeals(req.body);
    res.status(status.OK).send({ success: true, message: "Meals Filtered Successfully.", meals });
});

const getSingleMeal = catchAsync(async (req, res) => {
    const meal = await mealService.getMealById(req.params.id); 
    res.status(status.OK).send({ success: true, message: "Meal Fetched Successfully.", meal });
});

const favoriteMeals = catchAsync(async (req, res) => {
    const favMeals = await mealService.favoriteMeals(req.user); 
    res.status(status.OK).send({ success: true, message: "Favorite Meals Fetched Success.", favMeals });
});
  
const updateMeal = catchAsync(async (req, res) => {
    const response = await mealService.updateMealById(req.params.id, req.file, req.body);
    // if (!response.success){
    //     return res.status(status.OK).send({ success: false, message: response.message, orders: response.data });
    // }
    res.status(status.OK).send({ success: true, message: 'Meal Updated Success', meal: response });
});

const toggleFavorite = catchAsync(async (req, res) => {
    const response = await mealService.toggleFavorite(req.user, req.body);
    response.success = true;
    res.status(status.OK).send(response);
});
  
const deleteMealById = catchAsync(async (req, res) => {
    const response = await mealService.deleteMealById(req.params.id, req.user);
    if (!response.success){
        return res.status(status.OK).send({ success: false, message: response.message, orders: response.data });
    }
    res.status(status.OK).send({ success: true, message: response.message });
});


module.exports = {
    createMeal,
    allMeals, 
    vendorMeals,
    assignedWeekActiveMeals,
    customerMeals, 
    filterMeals,
    getSingleMeal,
    favoriteMeals,
    updateMeal,
    toggleFavorite,
    deleteMealById,
}; 
