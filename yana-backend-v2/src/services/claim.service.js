const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const { Claims, Customer, Order } = require('../models'); 


const createClaim = async (body) => { 
    // check if claim num already exist
    let existingClaim = await Claims.findOne({ claim_num: body.claim_num });
    if (existingClaim) {
        throw new ApiError(status.CONFLICT, 'Claim already exists');
    }

    // check if customer exist
    if (!await Customer.findById(body.customer)) {
        throw new ApiError(status.BAD_REQUEST, 'Customer not found');
    }

    // check if order exist
    if (!await Order.findById(body.order)) {
        throw new ApiError(status.BAD_REQUEST, 'Order not found');
    }
    
    // create new claim
    return await Claims.create(body);
};

const getAllClaims = async (statusFilter) => {  
  const claims = await Claims.find({
    ...(statusFilter && statusFilter !== "all" && { status: statusFilter })
  }).populate('customer order').sort({ createdAt: -1 });

  return claims;
};

const getSingleClaim = async (id) => {
  const claim = await Claims.findById(id).populate('customer order');
  if (!claim) {
    throw new ApiError(status.NOT_FOUND, 'Claim not found');
  }
  return claim;
};

const getClaimsStatistics = async (query) => {
  let { period, month, year } = query;
  let matchStart, matchEnd, groupByFormat;

  if (period === 'month') {
    // Month name to number
    const monthMap = {
      January: 0, February: 1, March: 2, April: 3,
      May: 4, June: 5, July: 6, August: 7,
      September: 8, October: 9, November: 10, December: 11
    };

    const monthNumber = monthMap[month];
    const yearIs = parseInt(year);

    if (isNaN(monthNumber) || isNaN(yearIs)) {
      throw new Error("Invalid month or year input.");
    }

    matchStart = new Date(yearIs, monthNumber, 1);
    matchEnd = new Date(yearIs, monthNumber + 1, 1);
    groupByFormat = { $dateToString: { format: "%Y-%m-%d", date: "$created_date" } };

  } else if (period === 'year') {
    const yearIs = parseInt(year);

    if (isNaN(yearIs)) {
      throw new Error("Invalid year input.");
    }

    matchStart = new Date(yearIs, 0, 1); // Jan 1
    matchEnd = new Date(yearIs + 1, 0, 1); // Jan 1 next year
    groupByFormat = { $dateToString: { format: "%Y-%m", date: "$created_date" } };

  } else {
    throw new Error("Period must be either 'month' or 'year'.");
  }
  

  // Graph stats
  const graphStats = await Claims.aggregate([
    {
      $match: {
        created_date: { $gte: matchStart, $lt: matchEnd },
      }
    },
    {
      $group: {
        _id: groupByFormat, 
        paidAmount: { $sum: { $ifNull: ["$paid_amount", 0] } },
        billedAmount: { $sum: { $ifNull: ["$billed_amount", 0] } }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Summary totals
  const totals = await Claims.aggregate([
    {
      $match: {
        created_date: { $gte: matchStart, $lt: matchEnd },
      }
    },
    {
      $group: {
        _id: null,
        totalClaims: { $sum: 1 },
        totalBilledAmount: { $sum: { $ifNull: ["$billed_amount", 0] } },
        totalPaidAmount: { $sum: { $ifNull: ["$paid_amount", 0] } },
        totalDeniedAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "denied"] }, { $ifNull: ["$billed_amount", 0] }, 0]
          }
        },
        totalPendingAmount: {
          $sum: {
            $cond: [{ $in: ["$status", ["in_process", "billed"]] }, { $ifNull: ["$billed_amount", 0] }, 0]
          }
        }
      }
    }
  ]);

  // 3. Claims list
  const claims = await Claims.find({
    created_date: { $gte: matchStart, $lt: matchEnd }
  }).populate('customer order');

  return {
    graphStats,
    totals: totals[0] || {
      totalClaims: 0,
      totalBilledAmount: 0,
      totalPaidAmount: 0,
      totalDeniedAmount: 0,
      totalPendingAmount: 0
    },
    claims
  };
};

const updateClaim = async (id, updateBody) => { 
    const updatedClaim = await Claims.findByIdAndUpdate(id, updateBody, { new: true, runValidators: true });
    if (!updatedClaim) {
        throw new ApiError(status.NOT_FOUND, 'claim not found');
    }
    
    return updatedClaim;
};

const deleteClaim = async (id) => {
    const claim = await Claims.findByIdAndDelete(id);
    if (!claim) {
        throw new ApiError(status.NOT_FOUND, 'claim not found');
    } 
    return;
};

module.exports = {
    createClaim,
    getAllClaims,
    getSingleClaim,
    getClaimsStatistics,
    updateClaim,
    deleteClaim
};
