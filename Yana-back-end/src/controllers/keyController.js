import * as keyService from '../services/keyService.js';

export const getAssetLinkKey = async (req, res, next) => {
  try {
    const AssetLinkKey = await keyService.getAssetLinkKey();
    if (!AssetLinkKey) {
        res.status(400).json({ success: false, message:"Error Retriving Key"});
    }
    res.status(200).json({ success: true, data: AssetLinkKey.data});
  } catch (error) {
    next(error); // Pass error to the errorHandler middleware
  }
};
