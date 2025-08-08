const config = require('../config/config');
// const client = require("twilio")(config.twilioAccountSID, config.twilioAuthToken); 
 
// ==================={SEND CODE}====================
const SEND_CODE = async (phoneNo) => {
  const result = await client.verify.v2
    .services(config.twilioServiceID)
    .verifications.create({
      to: `${phoneNo}`,
      channel: "sms",
    }); 
  return result;
};

// ==================={VERIFY PHONE NUMBER}====================
const VERIFY_PHONE_NUMBER = async (phoneNo, code) => {
  const data = await client.verify.v2
    .services(config.twilioServiceID)
    .verificationChecks.create({
      to: `${phoneNo}`,
      code: code,
    });
  return data;
};

 

module.exports = { SEND_CODE, VERIFY_PHONE_NUMBER };
