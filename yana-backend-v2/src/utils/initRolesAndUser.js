const logger = require('../config/logger');
const { Role, User, Admin, Counter, OrderPlacingDuration, Organization } = require('../models'); 

const defaultRoles = [
  { name: 'admin', hierarchyLevel: 1, description: "default admin", permissions: [ 
      { page: 'order', actions: ['create', 'view', 'edit', 'delete', 'export', 'orderStarter'] },
      { page: 'participant', actions: ['create', 'view', 'edit', 'delete', 'generateCredentials', 'import', 'pending', 'approve'] },
      { page: 'participant_changes', actions: ['view', 'edit'] },
      { page: 'participant_requests', actions: ['view', 'edit'] },
      { page: 'meal', actions: ['create', 'view', 'edit', 'delete'] },
      { page: 'menu', actions: ['create', 'view', 'edit', 'delete', 'menuAssign'] },
      { page: 'vendor', actions: ['view', 'edit', 'delete'] },
      { page: 'review', actions: ['view', 'supportReview'] },
      { page: 'user', actions: ['create', 'view', 'edit', 'delete'] },
      // { page: 'role', actions: ['create', 'view', 'edit', 'delete'] },
      { page: 'pers', actions: ['view'] },
      { page: 'chat', actions: ['create', 'view'] },
      // { page: 'billing', actions: ['create', 'view', 'edit', 'delete'] },
      { page: 'task', actions: ['create', 'view', 'edit', 'delete'] },
      { page: 'ticket', actions: ['view', 'edit', 'delete'] },
      { page: 'rider', actions: ['create', 'view', 'edit', 'delete'] },
      // { page: 'zone', actions: ['create', 'view', 'edit', 'delete'] },
      // { page: 'map', actions: ['create', 'view', 'edit', 'delete'] },
      { page: 'route', actions: ['create', 'view', 'delete', 'assignRoutes'] },
      { page: 'claim', actions: ['create', 'view', 'edit', 'delete'] },  
    ] 
  }, 
  { name: 'customer', hierarchyLevel: 2, description: "default customer", permissions: [{ page: 'mobile-app', actions: ['mobile-app'] }] },
  { name: 'rider', hierarchyLevel: 2, description: "default rider", permissions: [{ page: 'mobile-app', actions: ['mobile-app'] }] },
];

const counterModules = ["VEN", "RID", "ORD", "PS", "TSK", "TKT"]; 

const initializeRolesAndUser = async () => {
  try { 
    // ######## Roles #########
    for (const roleData of defaultRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) { 
        const adminOrg = await Organization.findOneAndUpdate(
          { name: 'admin-organization' },
          { name: 'admin-organization' },
          { new: true, upsert: true }
        );
        roleData.organization = adminOrg._id;
        await Role.create(roleData);
        logger.info(`Role "${roleData.name}" created.`); 
      } else {
        const updatedRole = await Role.findByIdAndUpdate(
          existingRole._id,
          { $set: roleData },
          { new: true, runValidators: true }  
        );
        logger.info(`Role "${roleData.name}" updated.`);
      }
    }

    // ######## Check and Create Admin User ######### 
    const usersCount = await User.countDocuments();
    if(usersCount === 0) {
      const role = await Role.findOne({ name: 'admin' });
      if(role){  
        const adminOrg = await Organization.findOneAndUpdate(
          { name: 'admin-organization' },
          { name: 'admin-organization' },
          { new: true, upsert: true }
        );
        let saveUser = { 
          username: 'admin',
          email: 'admin@gmail.com',
          password: 'admin',
          role: role._id,  
          organization: adminOrg._id,
          hierarchyLevel: role.hierarchyLevel,
        };
        let user = await User.create(saveUser);
      
        let saveAdminUser = {
          user: user._id, 
          name: "Super Admin",
          phone: "+1987654321",
          gender: "male",
          status: "active"
        };  
        await Admin.create(saveAdminUser);

        logger.info(`########## Admin User Created ##########`);
        logger.info(`Admin username: 'admin'`);
        logger.info(`Admin password: 'admin'`);
      }
    }

    // ######## Initializing Counter ######### 
    for (const name of counterModules) {
      await Counter.findOneAndUpdate(
        { _id: name },
        { $setOnInsert: { seq: 999 } },
        { upsert: true }
      );
    }

    // ######## Initializing OrderPlacingDuration ######### 
    // const duration = await OrderPlacingDuration.findOne();
    // if(!duration){
    //   await OrderPlacingDuration.create({startDay: "Monday", endDay: "Friday"});
    // }

  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

module.exports = initializeRolesAndUser;
