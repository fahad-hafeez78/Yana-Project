const { status } = require('http-status');
const ApiError = require('../utils/ApiError');
const xlsx = require("xlsx");
const { Customer, CustomerPendingChanges, User, Role, CustomerRequest, Meal, Ticket, Admin } = require('../models'); 
const { sendSMS, sendNotification, getCoordinatesFromAddress, getVendorIdForUser } = require("../utils/helper")
const moment = require("moment-timezone")
const { 
  isCurrentMonthAndYear, 
  formatDate, 
  combineAndSegregateRows, 
  getOrCreateCoordinator,
  getOrCreateInsurance,
  findOrCreateCoordinator,
  findOrCreateInsurance,
  formatPhoneNumber,
  generateUniqueUsernameAndPasswordCustomer,
  extractTotalFromNote
} = require('../utils/helper');  
const generateUniqueId = require('../utils/generateUnique');
const { uploadToS3, deleteFromS3 } = require('./s3Bucket.service');

  
const importAndCompare = async (file) => { 
  try {
    if(!file) throw new ApiError(status.NOT_FOUND, 'file is required');
    
    // Load workbook from buffer (no need to write to disk)
    let workbook = xlsx.read(file.buffer, { type: 'buffer' });
     
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new ApiError(status.NOT_FOUND, 'No sheets found in the uploaded file');
  
    // Convert sheet to JSON
    let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    if (!data.length) throw new ApiError(status.NOT_FOUND, 'No data found in the uploaded file'); 

    const filteredData = data.filter(row => isCurrentMonthAndYear(formatDate(row.StartDT)));
    const unionedData = combineAndSegregateRows(filteredData);

    const memberIds = unionedData.map(d => d.MemberID).filter(Boolean);

    const existingCustomers = await Customer.find({ memberId: { $in: memberIds } })
      .populate("coordinator")
      .populate("insurance")
      .lean();

    const customerMap = new Map(existingCustomers.map(c => [c.memberId, c]));

    const coordinatorCache = new Map();
    const insuranceCache = new Map();

    let pendingChangesCustomerCount = 0;
    let bulkCustomerInserts = [];
    let bulkCustomerUpdates = [];
    let bulkPendingChanges = [];
 
    for (const row of unionedData) {
      let { MemberID, MedicaidID, Name, Phone, IOType, AuthNumberFacets, MemberDOB, StartDT, EndDT, ICD10Code, Note } = row;
      if (!MemberID) continue;

      if(!IOType) IOType = null;

      const phone = Phone ? formatPhoneNumber(String(Phone)) : null;
      const mealPlan = extractTotalFromNote(row.Note);
      const dob = formatDate(MemberDOB);
      const start = formatDate(StartDT);
      const end = formatDate(EndDT);
      
      const coordinator = await getOrCreateCoordinator(row, coordinatorCache);
      const insurance = await getOrCreateInsurance(row, insuranceCache, mealPlan);

      const customer = customerMap.get(String(MemberID));

      if (customer) {
        if (customer.status === 'active') {
          const changes = [];
          if (customer.medicaidId !== String(MedicaidID)) changes.push({ customer: customer._id, field: 'medicaidId', previousValue: customer.medicaidId, newValue: String(MedicaidID) });
          if (customer.name !== String(Name)) changes.push({ customer: customer._id, field: 'name', previousValue: customer.name, newValue: String(Name) });
          if (customer.phone !== phone) changes.push({ customer: customer._id, field: 'phone', previousValue: customer.phone, newValue: phone });
          if (customer.io_type !== IOType) changes.push({ customer: customer._id, field: 'io_type', previousValue: customer.io_type, newValue: IOType });
          if (customer.auth_number_facets !== String(AuthNumberFacets)) changes.push({ customer: customer._id, field: 'auth_number_facets', previousValue: customer.auth_number_facets, newValue: String(AuthNumberFacets) });
          if (formatDate(customer.dob) !== dob) changes.push({ customer: customer._id, field: 'dob', previousValue: customer.dob, newValue: dob });
          // if (formatDate(customer.start_date) !== start) changes.push({ customer: customer._id, field: 'start_date', previousValue: customer.start_date, newValue: start });
          // if (formatDate(customer.end_date) !== end) changes.push({ customer: customer._id, field: 'end_date', previousValue: customer.end_date, newValue: end });
          if (String(customer.coordinator._id) !== String(coordinator._id)) changes.push({ customer: customer._id, field: 'coordinator', previousValue: JSON.stringify(customer.coordinator), newValue: JSON.stringify(coordinator) });
          if (String(customer.insurance._id) !== String(insurance._id)) changes.push({ customer: customer._id, field: 'insurance', previousValue: JSON.stringify(customer.insurance), newValue: JSON.stringify(insurance) });

          if (changes.length > 0) { 
            bulkPendingChanges.push(...changes); 
            bulkCustomerUpdates.push({
              updateOne: {
                filter: { _id: customer._id },
                update: { status: 'inactive' }
              }
            });  
            pendingChangesCustomerCount++;
          }
        } else if (customer.status === 'pending') { 
          bulkCustomerUpdates.push({
            updateOne: {
              filter: { _id: customer._id },
              update: {
                medicaidId: MedicaidID,
                name: Name,
                phone,
                dob,
                start_date: start,
                end_date: end,
                io_type: IOType,
                auth_number_facets: AuthNumberFacets,
                insurance: insurance._id, 
                coordinator: coordinator._id
              }
            }
          }); 
        }
      } else { 
        bulkCustomerInserts.push({
            memberId: MemberID,
            medicaidId: MedicaidID,
            customer_id: await generateUniqueId("PS"),
            name: Name,
            phone,
            dob: dob || null,
            start_date: start || null,
            end_date: end || null,
            auth_number_facets: AuthNumberFacets || null,
            icd10code: ICD10Code || null,
            io_type: IOType || null, 
            insurance: insurance._id, 
            coordinator: coordinator._id,
            status: 'pending',
          }); 
      }
    }

    let errors = [];
    let newCustomersCount = bulkCustomerInserts.length;
    let updatedCustomersCount = bulkCustomerUpdates.length; 
  
    if (bulkCustomerInserts.length) {
      try {
        const result = await Customer.insertMany(bulkCustomerInserts,{ ordered: false });
        newCustomersCount = result.length;
      } catch (err) {
        if (err.writeErrors && err.writeErrors.length > 0) {
          newCustomersCount = bulkCustomerInserts.length - err.writeErrors.length;
          for (const writeError of err.writeErrors) {
            errors.push({
              type: "CustomerInsertion",
              memberId: writeError.err.op.memberId || "", 
              message: writeError.err.errmsg || writeError.message,
            });
          }
        } else {
          errors.push({ type: "CustomerInsertion", message: err.message });
        }
      }
    }

    if (bulkCustomerUpdates.length) {
      try {
        const result = await Customer.bulkWrite(bulkCustomerUpdates, { ordered: false });
        updatedCustomersCount = result.modifiedCount || 0;
        updatedCustomersCount = updatedCustomersCount - pendingChangesCustomerCount;
      } catch (err) {
        if (err.writeErrors && err.writeErrors.length > 0) {
          updatedCustomersCount = bulkCustomerUpdates.length - err.writeErrors.length;
          updatedCustomersCount = updatedCustomersCount - pendingChangesCustomerCount;
          for (const writeError of err.writeErrors) {
            const customerId = writeError.err.op.q._id || "";
            errors.push({
              type: "CustomerUpdate",
              customerId: customerId, 
              message: writeError.err.errmsg || writeError.message,
            });
          }
        } else {
          errors.push({ type: "CustomerUpdate", message: err.message });
        }
      }
    }

    if (bulkPendingChanges.length) {
      try {
        const result = await CustomerPendingChanges.insertMany(bulkPendingChanges, { ordered: false });
      } catch (err) {
        if (err.writeErrors && err.writeErrors.length > 0) { 
          for (const writeError of err.writeErrors) {
            errors.push({
              type: "CustomerPendingChange",
              customerId: writeError.err.op.customer || "", 
              message: writeError.err.errmsg || writeError.message,
            });
          }
        } else {
          errors.push({ type: "CustomerPendingChange", message: err.message });
        }
      }
    }
     
    return { newCustomersCount, updatedCustomersCount, pendingChangesCustomerCount, errors };

  } catch (error) { 
    throw new ApiError(500, error); 
  }
};

const createCustomer = async (body) => { 
  if(await Customer.findOne({memberId: body.memberId})){
    throw new ApiError(status.BAD_REQUEST, 'Member Id already exist');
  }

  if(body.phone){
    if(await Customer.findOne({phone: body.phone})){
      throw new ApiError(status.BAD_REQUEST, 'Phone already exist');
    }
  }
 
  const { username, password } = await generateUniqueUsernameAndPasswordCustomer(
    body.name.split(' ')[0],
    body.dob.split('T')[0]
  );
 
  let role = await Role.findOne({name: "customer"});
  if(!role){
    throw new ApiError(status.NOT_FOUND, 'customer role not found');
  }

  const fullAddress = `${body.address.street1}, ${body.address.street2 || ''}, ${body.address.city}, ${body.address.zip}, ${body.address.state}`;
  const geoPoint = await getCoordinatesFromAddress(fullAddress);
  body.address.coordinates = geoPoint;

  let saveUser = {
    username: username, 
    password: password,
    role: role._id,
    hierarchyLevel: role.hierarchyLevel,
  };
  let user = await User.create(saveUser);

  let coordinator = {};
  if(body.coordinator.name || body.coordinator.email || body.coordinator.phone){
    coordinator = await findOrCreateCoordinator(body.coordinator);
  }
  body.insurance.mealPlan = await extractTotalFromNote(body.insurance.note);
  if(body.insurance.mealPlan == 0){
    throw new ApiError(status.BAD_REQUEST, 'Insurance meal plan not found in note');
  }
  let insurance = await findOrCreateInsurance(body.insurance);

  let saveCustomer = {
    ...body,
    user: user._id,
    coordinator: coordinator._id ? coordinator._id : null,
    insurance: insurance._id,
    customer_id: await generateUniqueId("PS") 
  }; 
  let customer = await Customer.create(saveCustomer);

  // Send App link and Creds to Customer
  const appLink = "https://play.google.com/store/apps/details?id=com.yanaproject";
  const messagebody = {
      to: customer.phone,
      message: `Welcome to YANA APP!
      Your account has been successfully created. Here are your login details:
      - Username: ${username}
      - Temporary Password: ${password}

      You can access your app here:
      ${appLink}

      Please log in and update your password as soon as possible for security purposes.
      If you have any questions, feel free to contact our support team.

      Enjoy using our app!`
    };

  await sendSMS(messagebody);

  customer = customer.toObject();
  customer.username = username;
  customer.password = password;

  return customer;
};

const queryCustomers = async (currentUser, status) => {
  // Get vendor ID for the current user
  const vendorId = await getVendorIdForUser(currentUser);

  // Build match conditions
  const matchConditions = {};
  
  // Add status filter
  if (status !== "all") {
    matchConditions.status = status;
  } else {
    if (vendorId !== null) {
      matchConditions.status = { $in: ['active', 'inactive'] };
    }
  }
  
  // Add vendor filter if user is under a vendor
  if (vendorId !== null) {
    matchConditions.vendorId = vendorId;
  }

  const matchStage = [];

  // Add match stage if we have conditions
  if (Object.keys(matchConditions).length > 0) {
    matchStage.push({
      $match: matchConditions
    });
  }
   
  matchStage.push({ 
    $lookup: {
      from: 'admins',
      localField: 'vendorId',
      foreignField: '_id',
      as: 'vendorId',
    }, 
  });

  // Step 2: Flatten user array
  matchStage.push({
    $unwind: { 
      path: '$vendorId',
      preserveNullAndEmptyArrays: true, 
    }
  });
   
  // Step 4: Add additional lookups
  matchStage.push(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true,
      }
    },
    {
      $lookup: {
        from: 'coordinators',
        localField: 'coordinator',
        foreignField: '_id',
        as: 'coordinator',
      },
    },
    {
      $unwind: {
        path: '$coordinator',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'insurances',
        localField: 'insurance',
        foreignField: '_id',
        as: 'insurance',
      },
    },
    {
      $unwind: {
        path: '$insurance',
        preserveNullAndEmptyArrays: true,
      },
    }, 
  );

  // Step 5: Project required fields
  matchStage.push({
    $project: {
      _id: 1,
      address: 1,
      allergies: 1,
      alternate_contact: 1,
      auth_number_facets: 1,
      customer_id: 1,
      dob: 1,
      end_date: 1, 
      gender: 1,
      icd10code: 1,
      io_type: 1,
      medicaidId: 1,
      memberId: 1,
      phone: 1,
      photo: 1,
      start_date: 1,
      status: 1, 
      name: 1, 
      createdAt: 1,
      updatedAt: 1,
      user: { _id: 1, username: 1, role: 1 },
      coordinator: 1,
      insurance: 1,
      vendorId: { _id: 1, vendor_id: 1, name: 1, photo: 1 },
      mealPlan: '$insurance.mealPlan',
    },
  });

  // Step 6: Sort
  matchStage.push({
    $sort: { createdAt: -1 },
  });

  const customers = await Customer.aggregate(matchStage);
  return customers;
};

const getPersCustomers = async (statuss) => {
  const query = statuss === "all" ? {} : { pers_status: statuss };
  const customers = await Customer.aggregate([
    {
      $match: {
        ...query
      }
    },
    // Join with Insurance collection
    {
      $lookup: {
        from: 'insurances',
        localField: 'insurance',
        foreignField: '_id',
        as: 'insurance'
      }
    },
    // Unwind insurance array (safely — preserve customers without insurance)
    {
      $unwind: {
        path: '$insurance',
        preserveNullAndEmptyArrays: false
      }
    },

    // Filter customers where insurance.pcpt exists and is not null/undefined/empty
    {
      $match: {
        'insurance.pcpt': { $exists: true, $type: 'string', $nin: [null, ''], $ne: '' }
      }
    },

    // Join with User collection
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },

    // Join with Coordinator collection
    {
      $lookup: {
        from: 'coordinators',
        localField: 'coordinator',
        foreignField: '_id',
        as: 'coordinator'
      }
    },
    {
      $unwind: {
        path: '$coordinator',
        preserveNullAndEmptyArrays: true
      }
    },

    // Add mealPlan field from insurance
    {
      $addFields: {
        mealPlan: '$insurance.mealPlan'
      }
    },

    // Optionally project only the fields you care about
    {
      $project: {
        'customer_id': 1,
        'memberId': 1,
        'medicaidId': 1,
        'name': 1,
        'dob': 1, 
        'status': 1,
        'pers_status': 1,
        'user.username': 1,
        'user.role': 1,
        'coordinator': 1,
        'insurance': 1,
        'mealPlan': 1
      }
    }
  ]);
 
  return customers;
};

const getCustomerById = async (id) => {
  let customer = await Customer.findById(id)
    .populate("user", "username role")
    .populate("coordinator")
    .populate("insurance")
    .populate("vendorId", "vendor_id name photo")
    .lean();

  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  } 
 
  customer.mealPlan = customer.insurance?.mealPlan;
  return customer;
};

const generateCredential = async (customerId) => {
  const customer = await getCustomerById(customerId);
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  } 

  // if (!customer.zone) {
  //   throw new ApiError(status.NOT_FOUND, `Participant zone not found, please assign zone first`);
  // }

  if (!customer.vendorId) {
    throw new ApiError(status.NOT_FOUND, `Vendor not assigned to this participant, please assign vendor first`);
  }

  let vendor = await Admin.findById(customer.vendorId._id).populate("user", "username").lean();
    
  if (customer.status != "approved") {
    throw new ApiError(status.NOT_FOUND, `Participant status is ${customer.status}, It must be approved`);
  }
 
  const { username, password } = await generateUniqueUsernameAndPasswordCustomer(
    customer.name.split(' ')[0],
    customer.dob.toISOString().split('T')[0]
  );

  let role = await Role.findOne({name: "customer"});
  if(!role){
    throw new ApiError(status.NOT_FOUND, 'customer role not found');
  }

  let saveUser = {
    username: username, 
    password: password, 
    role: role._id,
    hierarchyLevel: role.hierarchyLevel,
  };
  let user = await User.create(saveUser);
  
  const updatedCustomer = await Customer.findByIdAndUpdate(
    customerId,
    { $set: {user: user._id, status: "active", pauseStartDt: null, pauseEndDt: null} },
    { new: true, runValidators: true }  
  );

  return {updatedCustomer, username, password};
};

const updateCustomerById = async (id, updateBody) => {
  const customer = await getCustomerById(id);
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  } 
  
  if(updateBody.coordinator){
    let coordinator = await findOrCreateCoordinator(updateBody.coordinator);
    updateBody.coordinator = coordinator._id; 
  }
  if(updateBody.insurance?.note){
    updateBody.insurance.mealPlan = await extractTotalFromNote(updateBody.insurance.note);
  }
  if(updateBody.insurance){
    let insurance = await findOrCreateInsurance(updateBody.insurance);
    updateBody.insurance = insurance._id;
  }

  if(updateBody.address){
    const fullAddress = `${updateBody.address.street1}, ${updateBody.address.street2 || ''}, ${updateBody.address.city}, ${updateBody.address.zip}, ${updateBody.address.state}`;
    const geoPoint = await getCoordinatesFromAddress(fullAddress);
    updateBody.address.coordinates = geoPoint;
  }
  
  const updatedCustomer = await Customer.findByIdAndUpdate(
    id,
    { $set: updateBody },
    { new: true, runValidators: true, omitUndefined: true }  
  );

  return updatedCustomer;
};

const deleteCustomerById = async (id) => {
  const customer = await getCustomerById(id);
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }

  await Customer.findByIdAndDelete(id);
  await User.findByIdAndDelete(customer.user);
  return; 
};

const getAllPendingChanges = async (currentUser) => {  
  const matchStage = [];
  // Get vendor ID for the current user
  const vendorId = await getVendorIdForUser(currentUser);
 
  matchStage.push({ 
    $lookup: {
      from: "customers",
      localField: "customer",
      foreignField: "_id",
      as: "customerDetails"
    } 
  });

  // Flatten customerDetails array
  matchStage.push({
    $unwind: "$customerDetails"
  });

  // customer's vendor
  matchStage.push({
    $lookup: {
      from: 'admins',
      localField: 'customerDetails.vendorId',
      foreignField: '_id',
      as: 'customerDetails.vendorId',
    },
  });

  matchStage.push({
    $unwind: { 
      path: '$customerDetails.vendorId',
      preserveNullAndEmptyArrays: true, 
    }
  }); 
 
  // if not admin
  if (vendorId) { 
    matchStage.push({
      $match: { 
        'customerDetails.vendorId._id': vendorId,
      },
    }); 
  }  

  // group 
  matchStage.push({
    $group: { 
      _id: "$customer",
      customerId: {
        $first: "$customer"
      },
      customerName: {
        $first: "$customerDetails.name"
      },
      medicaidId: {
        $first: "$customerDetails.medicaidId"
      },
      memberId: {
        $first: "$customerDetails.memberId"
      },
      status: {
        $first: "$customerDetails.status"
      },
      coordinatorId: {
        $first: "$customerDetails.coordinator"
      },
      insuranceId: {
        $first: "$customerDetails.insurance"
      },
      changes: {
        $push: {
          field: "$field",
          previousValue: "$previousValue",
          newValue: "$newValue"
        }
      }
    }
  });
  
  // Add additional lookups
  matchStage.push(
     {
      $lookup: {
        from: "coordinators",
        localField: "coordinatorId",
        foreignField: "_id",
        as: "coordinatorData"
      }
    },
    {
      $lookup: {
        from: "insurances",
        localField: "insuranceId",
        foreignField: "_id",
        as: "insuranceData"
      }
    },
    {
      $unwind: "$coordinatorData"
    },
    {
      $unwind: "$insuranceData"
    },
    {
      $project: {
        _id: 0, 
        customerId: 1,
        customerName: 1,
        medicaidId: 1,
        memberId: 1,
        status: 1,
        changes: 1, 
      }
    } 
  );

    const pendingChanges = await CustomerPendingChanges.aggregate(matchStage);

    let formattedData = pendingChanges.map(customer => {
      return {
          ...customer,
          changes: customer.changes.map(change => {
              if (["coordinator", "insurance"].includes(change.field)) {
                let previousV = JSON.parse(change.previousValue);
                let newV = JSON.parse(change.newValue);
                if (change.field === "coordinator") {
                  return {
                    ...change,
                    previousValue: {email: previousV.email, name: previousV.name, phone: previousV.phone},
                    newValue: {email: newV.email, name: newV.name, phone: newV.phone}
                  };
                } else if (change.field === "insurance") {
                  return {
                    ...change,
                    previousValue: {m_auth_units_approved: previousV.m_auth_units_approved, m_frequency: previousV.m_frequency, mcpt: previousV.mcpt, mealPlan: previousV.mealPlan, note: previousV.note, p_auth_units_approved: previousV.p_auth_units_approved, p_frequency: previousV.p_frequency, pcpt: previousV.pcpt},
                    newValue: {m_auth_units_approved: newV.m_auth_units_approved, m_frequency: newV.m_frequency, mcpt: newV.mcpt, mealPlan: newV.mealPlan, note: newV.note, p_auth_units_approved: newV.p_auth_units_approved, p_frequency: newV.p_frequency, pcpt: newV.pcpt}
                  };
                }  
              }
              return change;
          })
      };
    });
   
  return formattedData;
};

const applyCustomerChanges = async (customerId) => { 

  try {
    const pendingChanges = await CustomerPendingChanges.find({
      customer: customerId
    });

    if (pendingChanges.length === 0) { 
      throw new ApiError(status.NOT_FOUND, `No pending changes found for customer with ID: ${customerId}`);
    }

    let updateFields = {};

    for (const change of pendingChanges) {
      if (change.field === 'coordinator' || change.field === 'insurance') {
        try {
          let doc = JSON.parse(change.newValue);
          updateFields[change.field] = doc._id;
        } catch (error) { 
          throw new ApiError(status.BAD_REQUEST, `Invalid JSON format for field: ${change.field}`);
        }
      } else {
        updateFields[change.field] = change.newValue;
      }
    }

    updateFields.status = 'active';

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedCustomer) { 
      throw new ApiError(status.NOT_FOUND, `Customer with ID: ${customerId} not found`);
    }

    await CustomerPendingChanges.deleteMany({
      customer: customerId
    });
 
    return updatedCustomer;
  } catch (error) { 
    throw new ApiError(status.INTERNAL_SERVER_ERROR, `Failed to apply changes: ${error.message}`);
  }
};

const loggedInCustomerDetails = async (currentUser) => { 
    let user = await User.findById(currentUser._id).select("username email createdAt updatedAt").lean();
    if (!user) {
      throw new ApiError(status.NOT_FOUND, 'user not found'); 
    }

    user.role = currentUser.role.name;

    const customer = await Customer.findOne({user: user._id})
    .populate("coordinator")
    .populate("insurance")
    .populate("favorites", "name image category description ingredients nutrition_info")
    .lean();

    if (!customer) {
      throw new ApiError(status.NOT_FOUND, 'customer not found'); 
    } 
     
    user.customer = customer;
    return user; 
};

const updateCustomerPhoto = async (currentUser, file) => { 
    if (!file) throw new ApiError(status.NOT_FOUND, 'Photo not found'); 
 
    const customer = await Customer.findOne({ user: currentUser._id, status: "active" }) 
    .populate("user", "username email createdAt updatedAt") 
    .lean();
 
    if (!customer) throw new ApiError(status.NOT_FOUND, 'Active customer not found');      
  
    if (customer.photo) {
      const imageKey = customer.photo.split(`.amazonaws.com/`)[1]; // Extract key from URL
      if (imageKey) deleteFromS3(imageKey);
    }

    const imageUrl = await uploadToS3(file, "participant");
    
    await Customer.findByIdAndUpdate(
      customer._id,
      { $set: {photo: imageUrl} },
      { new: false }  
    );
      
  const updatedCustomer = await Customer.findOne({user: currentUser._id})
    .populate("coordinator")
    .populate("insurance")
    .populate("favorites", "name image category description ingredients nutrition_info")
    .lean();
     
    let user = customer.user;
    user.role = currentUser.role.name;
    user.customer = updatedCustomer;
    return user;
};

const createRequest = async (user, body) => {  
  const customer = await Customer.findById(user.customer._id);
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found'); 
  }  

  const pendingRequestExist = await CustomerRequest.findOne({customer: customer._id, type: body.type, status: "pending"});
  if (pendingRequestExist) {
    throw new ApiError(status.FOUND, `${body.type.toLowerCase()} pending request already exist`); 
  } 
  
  // Additional validation for "pause" type
  if (body.type === "pause") {
    const { pauseStartDt, pauseEndDt } = body;

    // Check both dates are provided
    if (!pauseStartDt || !pauseEndDt) {
      throw new ApiError(status.BAD_REQUEST, 'pauseStartDt and pauseEndDt are required when type is "pause"');
    }

    const start = moment(pauseStartDt).format("YYYY-MM-DD");
    const end = moment(pauseEndDt).format("YYYY-MM-DD");
    const today = moment.tz("America/New_York").format("YYYY-MM-DD");
    
    if (start > end) {
      throw new ApiError(status.BAD_REQUEST, 'pauseEndDt cannot be before pauseStartDt');
    }

    // Ensure pauseStartDt is not in the past
    if (start < today) {
      throw new ApiError(status.BAD_REQUEST, 'pauseStartDt cannot be before than the current date.');
    }
  }
  
  body.customer = customer._id;   
  const request = await CustomerRequest.create(body);

  // Notify admins (non-blocking)
  (async () => {
    const vendorOfOrder = await Admin.findById(customer.vendorId).populate({
      path: "user", populate: { path: "organization", select: "name" }
    });
    const vendorOrgId = vendorOfOrder?.user?.organization?._id;
    const adminOrg = await Organization.findOne({ name: 'admin-organization' });
    const orgIds = [vendorOrgId];
    if (adminOrg) orgIds.push(adminOrg._id);
    const orgUsers = await User.find({ organization: { $in: orgIds } }).select('_id role').lean();
    const roleIds = orgUsers.map(u => u.role);

    // Fetch roles with 'order' page and 'view' action permission
    const rolesWithOrderView = await Role.find({
      _id: { $in: roleIds },
      permissions: {
        $elemMatch: {
          page: 'participant_requests',
          actions: 'view'
        }
      }
    }).select('_id').lean();
    const allowedRoleIds = rolesWithOrderView.map(r => r._id.toString()); 
    // Filter users who have a matching allowed role
    const allowedUserIds = orgUsers
      .filter(u => allowedRoleIds.includes(u.role.toString()))
      .map(u => u._id);
    
    // Get admin users and their FCM tokens
    const adminUsers = await Admin.find({ user: { $in: allowedUserIds } }).select('fcm').lean();
    const adminFcmTokens = adminUsers.map(a => a.fcm).filter(Boolean); // remove nulls

    const adminTitle = "New Request Received";
    const adminBody = `${customer.name} send a new request.`;
    // Send FCM notification to all admins (in parallel)
    await Promise.all(
      adminFcmTokens.map(token =>
        sendNotification(adminTitle, adminBody, token, "")
      )
    ); 
  })().catch(console.error);

  return request;
};

const getAllRequests = async (currentUser, status) => {  
    let matchStage = []; 
    // Get vendor ID for the current user
    const vendorId = await getVendorIdForUser(currentUser);
 
    matchStage.push({
      $lookup: {
        from: 'customers',
        let: { customerId: '$customer' },
        pipeline: [
          { 
            $match: { 
              $expr: { $eq: ['$_id', '$$customerId'] } 
            } 
          },
          { 
            $project: { 
              memberId: 1, 
              medicaidId: 1, 
              name: 1, 
              vendorId: 1
            } 
          }
        ],
        as: 'customer'
      }
    });

    matchStage.push({
      $unwind: '$customer'
    });

    // customer's vendor
  matchStage.push({
    $lookup: {
      from: 'admins',
      let: { vendorId: '$customer.vendorId' },
      pipeline: [
        {
          $match: { $expr: { $eq: ['$_id', '$$vendorId'] } }
        },
        {
          $project: { 
            _id: 1,
            vendor_id: 1,
            name: 1,
            user: 1
          }
        }
      ],
      as: 'customer.vendor',
    },
  });

  matchStage.push({
    $unwind: { 
      path: '$customer.vendor',
      preserveNullAndEmptyArrays: true, 
    }
  });
  
  // if vendor
  if (vendorId) { 
    if (status === "all") { 
      matchStage.push({
        $match: { 
          'customer.vendor._id': vendorId, 
        },
      }); 
    } else {
      matchStage.push({
        $match: { 
          'customer.vendor._id': vendorId,
          status: status
        },
      }); 
    }
  } else {
    if (status !== "all") { 
      matchStage.push({
        $match: { 
          status: status
        },
      }); 
    }
  }

  matchStage.push({
    $unset: [
      "customer.vendorId", 
    ],
  });

  matchStage.push({
    $sort: { createdAt: -1 },
  });


    // Aggregation
    const requests = await CustomerRequest.aggregate(matchStage);
    return requests; 
};

const requestAction = async (body) => { 
  const request = await CustomerRequest.findById(body.requestId).populate("customer", "memberId medicaidId name status fcm");
  if (!request) {
    throw new ApiError(status.NOT_FOUND, 'request not found');
  }  
  if (request.status == 'approved') {
    throw new ApiError(status.OK, 'Already Approved');
  } 
  if (!request.customer._id) {
    throw new ApiError(status.NOT_FOUND, 'customer not found'); 
  } 
 
 
  if (body.action == 'rejected') {
    const rejectedRequest = await CustomerRequest.findByIdAndUpdate(
      body.requestId,
      { status: 'rejected' },
      { new: true }  
    );

    if (request.customer.fcm) {
      const title = "Request Rejected";
      const bodyText = `Your request is rejected by support.`;
      const fcmToken = request.customer.fcm;
      const imgURL = "https://cdn-icons-png.flaticon.com/256/1478/1478938.png";

      // Send notification
      await sendNotification(title, bodyText, fcmToken, imgURL);
    } 

    return rejectedRequest; 
  } else if (body.action == 'approved'){ 
    if (request.type === 'status') {   
      // Toggle the status based on the current status
      const newStatus = request.customer.status === 'active' ? 'inactive' : 'active';
      const updatedCustomer = await Customer.findByIdAndUpdate(
        request.customer._id,
        { status: newStatus },
        { new: true } 
      ); 
      console.log(`Customer status set to: ${newStatus}.`);
      if (request.customer.fcm) {
        const title = "Status Request Approved";
        const bodyText = `Your request to change your status was approved by support. Connect Supper https://yana.support/`;
        const fcmToken = request.customer.fcm;
        const imgURL = "https://cdn-icons-png.flaticon.com/256/1478/1478938.png";

        // Send notification
        await sendNotification(title, bodyText, fcmToken, imgURL);
      }
    } else if (request.type === 'delete') {
      // Delete the customer
      const deletedCustomer = await Customer.findByIdAndDelete(request.customer._id);
      if (!deletedCustomer) {
        throw new ApiError(status.OK, 'customer not found'); 
      }
      await User.findByIdAndDelete(deletedCustomer.user);
 
      await CustomerRequest.deleteMany({ customer: request.customer._id });
      await Ticket.deleteMany({ user: deletedCustomer.user, status: { $in: ['unassigned', 'open'] } });
        
      console.log(`Customer and It's User deleted.`);
      if (request.customer.fcm) {
        const title = "Account Deletion Approved";
        const bodyText = `Your request to delete you account was approved by support. Connect Supper https://yana.support/`;
        const fcmToken = request.customer.fcm;
        const imgURL = "https://cdn-icons-png.flaticon.com/256/1478/1478938.png";

        // Send notification
        await sendNotification(title, bodyText, fcmToken, imgURL);
      }  
    } else if (request.type === 'pause') {

      const start = moment(request.pauseStartDt).format("YYYY-MM-DD");
      const end = moment(request.pauseEndDt).format("YYYY-MM-DD");
      const today = moment.tz("America/New_York").format("YYYY-MM-DD");
      
      const customer = await Customer.findById(request.customer._id);
      const updateData = {};
    
      if (moment(start).isSameOrBefore(today)) {
        updateData.status = "inactive";
        updateData.pauseStartDt = null;
        updateData.pauseEndDt = end;
      } else {
        updateData.pauseStartDt = start;
        updateData.pauseEndDt = end;
      }
  
      // Execute the update
      await Customer.findOneAndUpdate({ _id: customer._id },{ $set: updateData },);

      if (request.customer.fcm) {
        const title = "Pause Request Approved";
        const bodyText = `Your request to pause your account was approved by support. Connect Supper https://yana.support/`;
        const fcmToken = request.customer.fcm;
        const imgURL = "https://cdn-icons-png.flaticon.com/256/1478/1478938.png";

        // Send notification
        await sendNotification(title, bodyText, fcmToken, imgURL);
      }
    }
    
    const updatedRequest = await CustomerRequest.findByIdAndUpdate(
      body.requestId,
      { status: 'approved' },
      { new: true }
    );
  
    return updatedRequest;
  }
};
 
const updateCustomerStatus = async (id, status) => {
  const customer = await Customer.findById(id);
  if (!customer) {
    throw new ApiError(status.NOT_FOUND, 'customer not found');
  }

  const updatedCustomer = await Customer.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  );

  return updatedCustomer;
};

const bulkStatusUpdate = async (ids, newStatus) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, message: "Invalid input: Ids must be a non-empty array", data: {} };
  }

  const customers = await Customer.find({ _id: { $in: ids } });

  if (customers.length == 0) {
      return { 
          success: false, 
          message: "No customers found with the provided Ids", 
          data: {}
      };
  }

  let updatedCount = 0;
  const updatedCustomers = [];

  for (let customer of customers) {
    if (customer.status !== newStatus) {
      let updateData = { status: newStatus };
    
      // Add additional fields based on status if needed
      if (newStatus === 'active') {
        updateData.start_date = moment().tz("America/New_York");
      } else if (newStatus === 'inactive') {
        updateData.end_date = moment().tz("America/New_York");
      }

      const updated = await Customer.findByIdAndUpdate(
          customer._id, 
          updateData, 
          { new: true, runValidators: true }
      );
      updatedCustomers.push(updated);
      updatedCount++;
    } 
  }

  return { 
      success: true, 
      message: "Customers updated successfully", 
      data: {
      totalRequested: ids.length,
      updatedCount: updatedCount,
      updatedCustomers: updatedCustomers
    } 
  };
};


module.exports = {
  importAndCompare,
  createCustomer,
  queryCustomers,
  getPersCustomers,
  getCustomerById,
  generateCredential,
  updateCustomerById,
  deleteCustomerById,
  getAllPendingChanges,
  applyCustomerChanges,
  loggedInCustomerDetails,
  updateCustomerPhoto,
  createRequest,
  getAllRequests,
  requestAction, 
  updateCustomerStatus,
  bulkStatusUpdate
};