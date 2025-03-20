import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    refreshToken: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
}, {
    collection: 'RefreshTokens',
    timestamps: true,
}
);

export default mongoose.model('RefreshTokens', refreshTokenSchema);
