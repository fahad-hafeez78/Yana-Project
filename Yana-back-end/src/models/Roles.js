import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Role name must be provided"],
        unique: [true, "Role name already exists"],
    },
    permissions: {
        type: [String],
        required: [true, "Permissions must be provided"],
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },

}, {
    collection: 'Roles',
    timestamps: true,
});

export default mongoose.model('Roles', roleSchema);
