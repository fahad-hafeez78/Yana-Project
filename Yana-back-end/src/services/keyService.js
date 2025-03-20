var assetlinkkey = "../../Keys/assetlinks.json";

export const getAssetLinkKey = async () => {
  try {
    return {success:true, data:assetlinkkey};
  } catch (error) {
    return {success:false, error};
  }
};
