import { useEffect, useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import { useNavigate } from "react-router-dom";
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import umsMiddleware from "../../../redux/middleware/umsMiddleware";
import { useDispatch, useSelector } from "react-redux";
import tasksMiddleware from "../../../redux/middleware/tasksMiddleware";
import { showErrorAlert } from "../../../redux/actions/alertActions";
import Spinner from "../../../elements/customSpinner/Spinner";
import TaskFormFields from "../formFields/TaskFormFields";

export default function CreateNewTask() {
    
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    const [roles, setRoles] = useState([]);
    const [selectedRoleMembers, setSelectedRoleMembers] = useState([]);

    const [imageUrl, setImageUrl] = useState(null);
    const [areDropdownsDisabled, setAreDropdownsDisabled] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const [newTask, setNewTask] = useState({
        title: '',
        image: null,
        status: null,
        selectedRole: null,
        selectedMember: null,
        description: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'selectedRole') {
            setNewTask((prev) => ({ ...prev, selectedMember: null }));
            setNewTask((prev) => ({ ...prev, [name]: value }));
            if (value) fetchSelectedRoleMembers(value);
        }
        else {
            setNewTask((prev) => ({ ...prev, [name]: value }));
        }
    }

    const fetchSelectedRoleMembers = async (value) => {
        try {
            const response = await dispatch(umsMiddleware?.GetUsersByRoleId(value, 'task'));

            if (response && response.success) {
                const selectOption = { value: "", label: "Select" }
                const formattedRoles = response?.users?.map((user) => ({
                    value: user?.unified_user._id,
                    label: user.name,
                }));
                setSelectedRoleMembers([selectOption, ...formattedRoles]);
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await dispatch(roleMiddleware.GetRolesForCurrentUser('task'));
                if (response && response.success) {
                    const selectOption = { value: "", label: "Select" }
                    const formattedRoles = response?.roles?.map((role) => ({
                        value: role._id,
                        label: role.name,
                    }));
                    setRoles([selectOption, ...formattedRoles]);
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

    const handleCheckBox = (e) => {
        const isChecked = e.target.checked;
        setAreDropdownsDisabled(isChecked);

        if (isChecked) {
            setNewTask(prev => ({
                ...prev,
                selectedMember: user?._id,
                selectedRole: null
            }));
        } else {
            setNewTask(prev => ({
                ...prev,
                selectedMember: null,
                selectedRole: null
            }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if ((newTask?.selectedRole === null || newTask?.selectedRole === "Select") && !areDropdownsDisabled) {
            dispatch(showErrorAlert("Select Role"));
            return;
        }

        if ((newTask?.selectedMember === null || newTask?.selectedMember === "Select") && !areDropdownsDisabled) {
            dispatch(showErrorAlert("Select Member"));
            return;
        }

        if (newTask?.status === null || newTask?.status === "Select") {
            dispatch(showErrorAlert("Please Select Status"));
            return;
        }
        const formData = new FormData();
        formData.append('title', newTask?.title);
        formData.append('description', newTask?.description);
        formData.append('assignTo', newTask?.selectedMember);
        formData.append('status', newTask?.status);

        if (newTask?.image && newTask?.image.length > 0) {
            for (const file of newTask?.image) {
                formData.append('image', file);
            }
        }

        try {
            setIsLoading(true);
            const response = await dispatch(tasksMiddleware.CreateNewTask(formData))
            if (response?.success) {
                navigate(-1);
            }
        } catch (error) {

        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
    }

    const handleRemoveImage = () => {
        setNewTask(prev => ({ ...prev, image: null }))
    }

    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Create Task</h1>
                <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
            </div>

            <TaskFormFields
                newTask={newTask}

                roles={roles}
                user={user}

                selectedRoleMembers={selectedRoleMembers}
                areDropdownsDisabled={areDropdownsDisabled}
                handleInputChange={handleInputChange}

                imageUrl={imageUrl}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                handleCheckBox={handleCheckBox}

                handleSubmit={handleSubmit}
                handleCancel={() => navigate(-1)}

            />
        </div>
    );
}