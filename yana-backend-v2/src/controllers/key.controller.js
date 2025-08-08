const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
let assetlinkkey = require("../assets/assetlinks.json");

const getAssetLinkKey = catchAsync(async (req, res) => { 
  res.status(status.OK).send({ success: true, data: assetlinkkey });
});
 

module.exports = {
  getAssetLinkKey
};
