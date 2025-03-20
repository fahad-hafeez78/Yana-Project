export const generateParticipantUserName = (firstName) => {
    const randomNumber = Math.floor(Math.random() * 10000); // Random number between 0 and 9999
    return `${firstName}${randomNumber}`;
};

export const generateParticipantPassword = (name, dob) => {
    const basePassword = `${name}${dob.replace(/-/g, '')}`; // Remove dashes from DOB if present
    return basePassword;
};