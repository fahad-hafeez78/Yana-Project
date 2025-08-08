import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";
import AddTaskIcon from "../../assets/customIcons/tasksIcons/AddTaskIcon.svg";
import AllTasks from "../../components/tasks/AllTasks/AllTasks";
import { useNavigate } from "react-router-dom";
import usePermissionChecker from "../../util/permissionChecker/PermissionChecker";

export default function Tasks() {

    const navigate = useNavigate();
    
    const checkPermission = usePermissionChecker();
    const isCreatePermission=checkPermission('task', 'create');
    const isEditPermission=checkPermission('task', 'edit');

    const handleCreateNewTask = () => {
        navigate('/tasks/create-task');
    }

    return (
        <div className="flex flex-col h-full gap-3">
            {isCreatePermission && <div className="flex gap-3 justify-end items-center">
                <ButtonWithIcon
                    onClick={handleCreateNewTask}
                    icon={<img src={AddTaskIcon} alt="import file" width={18} height={18} />}
                    text="Create Task"
                    variant="primary"
                />
            </div>}
            <AllTasks isCreatePermission={isCreatePermission} isEditPermission={isEditPermission}/>
        </div>
    )
}