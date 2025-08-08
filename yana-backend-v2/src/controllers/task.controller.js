const { status } = require('http-status');  
const catchAsync = require('../utils/catchAsync');
const { taskService } = require('../services');

const createTask = catchAsync(async (req, res) => {
    const task = await taskService.createTask(req.user, req.file, req.body);
    res.status(status.CREATED).send({ success: true, message: "Task Created Successfully", task });
});
  
const allTasks = catchAsync(async (req, res) => { 
    const tasks = await taskService.allTasks(req.user, req.body);
    res.status(status.OK).send({ success: true, message: "Tasks Retrieved Successfully", tasks });
});

const getTask = catchAsync(async (req, res) => {
    const task = await taskService.getTaskById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Task Retrieved Successfully", task });
});
 
const updateTask = catchAsync(async (req, res) => {
    const task = await taskService.updateTaskById(req.params.id, req.file, req.body);
    res.status(status.OK).send({ success: true, message: 'Task Updated Successfully', task });
});
  
const deleteTask = catchAsync(async (req, res) => {
    await taskService.deleteTaskById(req.params.id);
    res.status(status.OK).send({ success: true, message: "Task Deleted Successfully" });
});

module.exports = {
    createTask,
    allTasks,
    getTask,  
    updateTask,
    deleteTask
};
