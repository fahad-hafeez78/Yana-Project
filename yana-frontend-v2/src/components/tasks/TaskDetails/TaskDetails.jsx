import { useEffect, useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import umsMiddleware from "../../../redux/middleware/umsMiddleware";
import { useDispatch, useSelector } from "react-redux";
import tasksMiddleware from "../../../redux/middleware/tasksMiddleware";
import Spinner from "../../../elements/customSpinner/Spinner";
import TaskFormFields from "../formFields/TaskFormFields";

export default function TaskDetails() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.user);
    const location = useLocation();
    const { taskDetails, isEditable } = location.state;

    const [isLoading, setIsLoading] = useState(false);

    const [roles, setRoles] = useState([]);
    const [selectedRoleMembers, setSelectedRoleMembers] = useState([]);
    const [imageUrl, setImageUrl] = useState(taskDetails?.image || null);
    const [isAssignedToMe, setIsAssignedToMe] = useState(
        taskDetails?.assignTo?.name === user?.admin_user?.name
    );

    const [newTask, setNewTask] = useState({
        title: taskDetails?.title || '',
        image: taskDetails?.image || null,
        status: taskDetails?.status || null,
        selectedRole: taskDetails?.assignTo?.role?._id || null,
        selectedMember: taskDetails?.assignTo?._id || null,
        description: taskDetails?.description || '',
    });

    useEffect(() => {
        if (isAssignedToMe) {
            setNewTask(prev => ({
                ...prev,
                selectedMember: user?._id,
                selectedRole: null
            }));
        }
    }, [isAssignedToMe, user?._id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'selectedRole') {
            setNewTask(prev => ({
                ...prev,
                selectedMember: null,
                [name]: value
            }));
            console.log("value", value)
            // if (value !== "Select") fetchSelectedRoleMembers(value);
        } else {
            setNewTask(prev => ({ ...prev, [name]: value }));
        }
    };

    const fetchSelectedRoleMembers = async (roleId) => {
        try {
            const response = await dispatch(umsMiddleware.GetUsersByRoleId(roleId, 'task'));

            if (response?.success) {
                const options = response.users.map(user => ({
                    value: user?.unified_user?._id,
                    label: user.name,
                }));
                setSelectedRoleMembers([{ value: "", label: "Select" }, ...options]);

                // If the current selected member belongs to this role, keep them selected
                if (newTask.selectedMember && !isAssignedToMe) {
                    const memberExists = response.users.some(user => user.unified_user._id === newTask.selectedMember);
                    if (!memberExists) {
                        setNewTask(prev => ({ ...prev, selectedMember: null }));
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching role members:', err);
        }
    };

    useEffect(() => {
        if (newTask.selectedRole && newTask.selectedRole !== "Select" && !isAssignedToMe) {
            fetchSelectedRoleMembers(newTask.selectedRole);
        }
    }, [newTask.selectedRole, isAssignedToMe]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await dispatch(roleMiddleware.GetRolesForCurrentUser('task'));
                if (response?.success) {
                    const options = response.roles.map(role => ({
                        value: role._id,
                        label: role.name,
                    }));
                    setRoles([{ value: "", label: "Select" }, ...options]);
                }
            } catch (err) {
                console.error('Error fetching roles:', err);
            }
        };
        fetchRoles();
    }, []);

    const handleImageUpload = (e) => {
        e.preventDefault();
        const file = Array.from(e.target.files);
        if (file.length > 0) {
            const imageFile = file[0];
            setNewTask((prev) => ({ ...prev, image: file }));
            const objectUrl = URL.createObjectURL(imageFile);
            setImageUrl(objectUrl);
        }
    };

    const handleRemoveImage = () => {
        setNewTask(prev => ({ ...prev, image: null }));
        setImageUrl(null);
    };

    const handleAssignToMe = (e) => {
        const checked = e.target.checked;
        setIsAssignedToMe(checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', newTask.title);
        formData.append('description', newTask.description);
        formData.append('assignTo', isAssignedToMe ? user._id : newTask.selectedMember);
        formData.append('status', newTask.status);

        if (newTask.image && typeof newTask.image !== 'string') {
            for (const file of newTask?.image) {
                formData.append('image', file);
            }
        }

        try {
            setIsLoading(true);
            const response = await dispatch(tasksMiddleware.UpdateTask(taskDetails?._id, formData));
            if (response?.success) {
                navigate(-1)
            }
        } catch (error) {
            console.error('Error updating task:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        navigate(-1)
    };

    if (isLoading) {
        return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
    }

    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Task Details</h1>
                <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
            </div>

            <TaskFormFields

                newTask={newTask}
                roles={roles}
                user={user}

                isAssignedToMe={isAssignedToMe}

                selectedRoleMembers={selectedRoleMembers}
                areDropdownsDisabled={isAssignedToMe}
                handleInputChange={handleInputChange}
                handleRemoveImage={handleRemoveImage}
                imageUrl={imageUrl}
                handleImageUpload={handleImageUpload}
                handleCheckBox={handleAssignToMe}
                isEditable={isEditable}
                handleSubmit={handleSubmit}
                handleCancel={() => navigate(-1)}

            />

        </div>
    );
}