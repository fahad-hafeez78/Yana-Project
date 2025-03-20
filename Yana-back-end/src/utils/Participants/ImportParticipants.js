import Participants from "../../models/Participants.js";
import ParticipantsChanges from "../../models/ParticipantsChanges.js";

export function combineAndSegregateRows(data, ignoredFields = []) {
    const groupedData = {};

    // Group rows by MemberID and MedicaidID
    data.forEach(row => {
        const key = `${row.MemberID}_${row.MedicaidID}`;
        if (!groupedData[key]) {
            groupedData[key] = {
                ...row,
                MCPT: null,
                PCPT: null,
                MAuthUnitsApproved: null,
                PAuthUnitsApproved: null,
                MFrequency: null,
                PFrequency: null,
            };

            // Remove ignored fields from the initial row
            ignoredFields.forEach(field => {
                delete groupedData[key][field];
            });
        }

        if (row.Code) {
            if (row.Code.startsWith("W17")) {
                groupedData[key].MCPT = groupedData[key].MCPT
                    ? `${groupedData[key].MCPT}, ${row.Code}`
                    : row.Code;

                groupedData[key].MAuthUnitsApproved = groupedData[key].MAuthUnitsApproved
                    ? `${groupedData[key].MAuthUnitsApproved}, ${row.AuthUnitsApproved}`
                    : row.AuthUnitsApproved;

                groupedData[key].MFrequency = groupedData[key].MFrequency
                    ? `${groupedData[key].MFrequency}, ${row.Frequency}`
                    : row.Frequency;
            } else if (row.Code.startsWith("W18")) {
                // Add to PCPT, PAuthUnitsApproved, and PFrequency
                groupedData[key].PCPT = groupedData[key].PCPT
                    ? `${groupedData[key].PCPT}, ${row.Code}`
                    : row.Code;

                groupedData[key].PAuthUnitsApproved = groupedData[key].PAuthUnitsApproved
                    ? `${groupedData[key].PAuthUnitsApproved}, ${row.AuthUnitsApproved}`
                    : row.AuthUnitsApproved;

                groupedData[key].PFrequency = groupedData[key].PFrequency
                    ? `${groupedData[key].PFrequency}, ${row.Frequency}`
                    : row.Frequency;
            }
        }

        // Combine other fields dynamically (excluding ignored fields)
        for (const field in row) {
            if (!ignoredFields.includes(field) && row[field] !== groupedData[key][field]) {
                if (!groupedData[key][field]) {
                    groupedData[key][field] = row[field];
                } else {
                    const currentValue = String(groupedData[key][field]);
                    const newValue = String(row[field]);
                    if (!currentValue.includes(newValue)) {
                        groupedData[key][field] = `${currentValue}, ${newValue}`;
                    }
                }
            }
        }
    });

    // Convert grouped data back to an array
    return Object.values(groupedData);
}



// Helper function to format dates and phone numbers
export const formatUnionedData = (unionedData) => {
    return unionedData.map(participant => {
        // Format Date fields
        participant.StartDT = formatDate(participant.StartDT);
        participant.EndDT = formatDate(participant.EndDT);
        participant.MemberDOB = formatDate(participant.MemberDOB);

        // Format phone numbers
        if (participant.Phone) {
            participant.Phone = formatPhoneNumber(participant.Phone);
        }
        if (participant.coordinatorPhone) {
            participant.coordinatorPhone = formatPhoneNumber(participant.coordinatorPhone);
        }

        return participant;
    });
};

// Helper function to format phone number
const formatPhoneNumber = (phoneNumber) => {
    let value = phoneNumber.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    if (value.length === 10) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
    }
    return value;
};

// Helper function to format date
const formatDate = (inputDate) => {
    let date;
    if (typeof inputDate === 'string' && inputDate.trim() !== '' && !isNaN(Date.parse(inputDate))) {
        date = new Date(inputDate);
    } else if (typeof inputDate === 'number' && !isNaN(inputDate)) {
        if (inputDate > 25569) {
            date = new Date((inputDate - 25569) * 86400 * 1000);
        } else {
            date = new Date(inputDate);
        }
    } else if (inputDate instanceof Date && !isNaN(inputDate.getTime())) {
        date = inputDate;
    } else {
        return "";
    }
    if (isNaN(date.getTime())) {
        return "";
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${month}-${day}-${year}`;
};

// Helper function to compare the fields of an existing participant and a new participant
export const compareParticipantFields = (existingParticipant, newParticipant) => {

    const fieldsToCompare = [
        { field: 'MedicaidID', accessor: (row) => String(row.MedicaidID) || null, customerValue: String(existingParticipant.MedicaidID) || null },
        { field: 'Name', accessor: (row) => String(row.Name) || null, customerValue: String(existingParticipant.Name) || null },
        { field: 'Phone', accessor: (row) => formatPhoneNumber(String(row.Phone)) || null, customerValue: formatPhoneNumber(String(existingParticipant.Phone)) || null },
        { field: 'IOType', accessor: (row) => String(row.IOType) || null, customerValue: String(existingParticipant.IOType) || null },
        { field: 'AuthNumberFacets', accessor: (row) => String(row.AuthNumberFacets) || null, customerValue: String(existingParticipant.AuthNumberFacets) || null },
        { field: 'MemberDOB', accessor: (row) => formatDate(row.MemberDOB) || null, customerValue: formatDate(existingParticipant.MemberDOB) || null },
        { field: 'StartDT', accessor: (row) => formatDate(row.StartDT) || null, customerValue: formatDate(existingParticipant.StartDT) || null },
        { field: 'EndDT', accessor: (row) => formatDate(row.EndDT) || null, customerValue: formatDate(existingParticipant.EndDT) || null },

        // New fields: Coordinator and Insurance
        { field: 'coordinatorName', accessor: (row) => String(row.coordinatorName) || null, customerValue: String(existingParticipant.coordinatorName) || null },
        { field: 'coordinatorPhone', accessor: (row) => String(row.coordinatorPhone) || null, customerValue: String(existingParticipant.coordinatorPhone) || null },
        { field: 'coordinatorEmail', accessor: (row) => String(row.coordinatorEmail) || null, customerValue: String(existingParticipant.coordinatorEmail) || null },

        // Insurance-related fields
        { field: 'MCPT', accessor: (row) => String(row.MCPT) || null, customerValue: String(existingParticipant.MCPT) || null },
        { field: 'MAuthUnitsApproved', accessor: (row) => String(row.MAuthUnitsApproved) || null, customerValue: String(existingParticipant.MAuthUnitsApproved) || null },
        { field: 'MFrequency', accessor: (row) => String(row.MFrequency) || null, customerValue: String(existingParticipant.MFrequency) || null },
        { field: 'PCPT', accessor: (row) => String(row.PCPT) || null, customerValue: String(existingParticipant.PCPT) || null },
        { field: 'PAuthUnitsApproved', accessor: (row) => String(row.PAuthUnitsApproved) || null, customerValue: String(existingParticipant.PAuthUnitsApproved) || null },
        { field: 'PFrequency', accessor: (row) => String(row.PFrequency) || null, customerValue: String(existingParticipant.PFrequency) || null },
        { field: 'Note', accessor: (row) => String(row.Note) || null, customerValue: String(existingParticipant.Note) || null },
    ];

    // Compare the fields and return the changes
    return compareFields(newParticipant, existingParticipant, fieldsToCompare);
};

export const compareFields = (newParticipant, existingParticipant, fieldsToCompare) => {
    const changes = [];

    fieldsToCompare.forEach(({ field, accessor, customerValue }) => {
        const newValue = accessor(newParticipant); // Access the new value using accessor
        const existingValue = customerValue; // Access the existing value (already passed in)
     
        if (newValue !== null && newValue !== undefined &&newValue !== "null" && newValue !== "undefined") {
            if (newValue !== existingValue) {
                // If values are different, record the change
                changes.push({
                    field,
                    previousValue: existingValue,
                    newValue: newValue,
                });
            }
        }
    });

    return changes;
};

export const saveParticipantChanges = async (existingParticipant, changes) => {

    const participantChange = new ParticipantsChanges({
        participantId: existingParticipant._id,
        fields: changes,
    });
    await participantChange.save();

    await Participants.updateOne(
        { _id: existingParticipant._id },
        {
            $set: { Status: 'Inactive' },
            $push: { changesHistory: { $each: changes } },
        }
    );
}


export const updateExistingParticipant = async (existingParticipant, changes) => {
    const updateFields = {};

    changes.forEach(change => {
        updateFields[change.field] = change.newValue;
    });
    await Participants.updateOne(
        { _id: existingParticipant._id },
        { $set: updateFields }
    );
};


export const updateExistingParticipantChanges = async (existingParticipant, changes) => {
    // Find the existing change record for the participant
    const existingChangeRecord = await ParticipantsChanges.findOne({ participantId: existingParticipant._id });

    if (existingChangeRecord) {
        for (let change of changes) {
            const fieldIndex = existingChangeRecord.fields.findIndex(fieldChange => fieldChange.field === change.field);

            if (fieldIndex !== -1) {
                existingChangeRecord.fields[fieldIndex].newValue = change.newValue;
                existingChangeRecord.fields[fieldIndex].previousValue = change.previousValue;
            } else {
                existingChangeRecord.fields.push(change);
            }
        }
        if (existingParticipant.Status === 'Inactive') {
            existingChangeRecord.Status = 'Inactive';
        }
        await existingChangeRecord.save();
    } else {
        const newChangeRecord = new ParticipantsChanges({
            participantId: existingParticipant._id,
            fields: changes,
        });
        await newChangeRecord.save();
    }
};
