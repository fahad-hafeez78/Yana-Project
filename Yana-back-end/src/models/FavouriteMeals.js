import mongoose from "mongoose";

const FavouriteMealsSchema = new mongoose.Schema({
    participantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Participant Id is required"],
    },
    meals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meals',
        required: [true, 'Meals are required to Favourite'],
    }],
}, {
    collection: 'FavouriteMeals',
    timestamps: true,
});

export default mongoose.model('FavouriteMeals', FavouriteMealsSchema);