import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participants',
  },
  participantName: {
    type: String,
    required: true,
  },
  Type: {
    type: String,
    enum: ['Delete', 'Status', 'Update'],
    required: true,
  },
  Request: {
    type: String,
    required: true,
  },
  Status: { // New field to track approval status
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
}, {
  collection: 'ParticipantRequests',
  timestamps: true,
});

export default mongoose.model('ParticipantRequests', requestSchema);
