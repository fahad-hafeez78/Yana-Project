import mongoose from "mongoose";

const participantsSchema = new mongoose.Schema({
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders',
    }],
    Username: {
        type: String,
        maxlength: 45,
    },
    Password: {
        type: String,
        maxlength: 64,
        // required: true, 
    },
    MemberID: {
        type: String,
        maxlength: 45,
        required: [true, "MemberID is required"],
    },
    MedicaidID: {
        type: String,
        maxlength: 45,
    },
    Name: {
        type: String,
        maxlength: 45,
    },
    Phone: {
        type: String,
        maxlength: 45,
        unique: true,
    },
    image: {
        type: String,
    },
    InsuranceCardImage: {
        type: String,
    },
    Gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },

    // Flattened fields from alternateContactAddress (previously using addressSchema)
    street1: {
        type: String,
        default: '',
    },
    street2: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    zipcode: {
        type: String,
        default: '',
    },


    alternateContactName: {
        type: String,
    },
    alternateContactPhone: {
        type: String,
    },

    // Flattened fields from alternateContactAddress (previously using addressSchema)
    alternateContactStreet1: {
        type: String,
        default: '',
    },
    alternateContactStreet2: {
        type: String,
        default: '',
    },
    alternateContactCity: {
        type: String,
        default: '',
    },
    alternateContactState: {
        type: String,
        default: '',
    },
    alternateContactZipcode: {
        type: String,
        default: '',
    },

    Allergies: {
        type: String,
        maxlength: 45,
    },
    MemberDOB: {
        type: Date,
    },
    IOType: {
        type: String,
        maxlength: 45,
    },
    AuthNumberFacets: {
        type: String,
        maxlength: 45,
    },
    StartDT: {
        type: Date,
    },
    EndDT: {
        type: Date,
    },
    ICD10Code: {
        type: String,
        maxlength: 45,
    },
    Role: {
        type: String,
        default: 'Participant',
        required: true,
    },
    Status: {
        type: String,
        maxlength: 45,
        default: 'Pending',
    },
    PauseStartDt: {
        type: Date,
        maxlength: 45,
        default: null,
    },
    PauseEndDt: {
        type: Date,
        maxlength: 45,
        required: false,
        default: null,
    },
    OTP: {
        type: String,
        default: '000000',
        maxlength: 6,
    },

    coordinatorName: {
        type: String,
    },
    coordinatorPhone: {
        type: String,
    },
    coordinatorEmail: {
        type: String,
    },

    // Flattened fields from insuranceSchema
    MCPT: {
        type: String,
        maxlength: 255,
    },
    MAuthUnitsApproved: {
        type: String,
        maxlength: 255,
    },
    MFrequency: {
        type: String,
        maxlength: 45,
    },
    PCPT: {
        type: String,
        maxlength: 255,
    },
    PAuthUnitsApproved: {
        type: String,
        maxlength: 255,
    },
    PFrequency: {
        type: String,
        maxlength: 45,
    },
    Note: {
        type: String
    }
}, {
    collection: 'Participants',
    timestamps: true,
});

export default mongoose.model('Participants', participantsSchema);
