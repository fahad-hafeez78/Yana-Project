import mongoose from "mongoose";

const MenuSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    meals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meals',
        required: [true, 'Meals are required'],
    }],
    image: {
        type: String,
        required: false,
    },
}, {
    timestamps: true,
    collection: 'Menu',
});

export default mongoose.model('Menu', MenuSchema);
