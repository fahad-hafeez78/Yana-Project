import { useEffect, useState } from "react";
import Checkbox from "../../../elements/checkBox/CheckBox";
import CustomDropdown from "../../../elements/customDropdown/CustomDropdown";
import { useDispatch } from "react-redux";
import roleMiddleware from "../../../redux/middleware/roleMiddleware";
import umsMiddleware from "../../../redux/middleware/umsMiddleware";

export default function AssignTicket({ assignField, setAssignField, user, isAssignmentComplete, setIsAssignmentComplete, ticketDetail }) {

    const dispatch = useDispatch();

    const [roles, setRoles] = useState([]);
    const [selectedRoleMembers, setSelectedRoleMembers] = useState([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {

                const response = await dispatch(roleMiddleware.GetRolesForCurrentUser('ticket', ticketDetail?.user?.vendorId?.user));
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

    const handleAssignToMe = (e) => {
        if (isAssignmentComplete) return;
        const checked = e.target.checked;
        setAssignField((prev) => ({ ...prev, isAssignedToMe: checked }));
    };

    const handleInputChange = (e) => {
        if (isAssignmentComplete) return;

        const { name, value } = e.target;

        if (value && name === 'selectedRole') {
            setAssignField((prev) => ({ ...prev, selectedMember: null, [name]: value }));
            fetchSelectedRoleMembers(value);
        } else {
            setAssignField((prev) => ({ ...prev, [name]: value }));
        }
    }

    const fetchSelectedRoleMembers = async (value) => {
        try {
            const response = await dispatch(umsMiddleware?.GetUsersByRoleId(value, 'ticket'));
            if (response && response.success) {

                const isVendor = roles?.find(role => role?.value === value);
                const filter = response?.users?.filter(user => user?._id === ticketDetail?.user?.vendorId?._id)

                let roleMembers = isVendor?.label === "vendor" ? filter : response?.users;

                const selectOption = { value: null, label: "Select" }
                const formattedRoles = roleMembers?.map((user) => ({
                    value: user?.unified_user?._id,
                    label: user.name,
                }));
                setSelectedRoleMembers([selectOption, ...formattedRoles]);
            }
        } catch (err) {
            console.error('Error fetching roles:', err);
        }
    };

    useEffect(() => {
        if (assignField.selectedRole && !assignField.isAssignedToMe) {
            fetchSelectedRoleMembers(assignField.selectedRole);
        }
    }, [assignField.selectedRole, assignField.isAssignedToMe]);

    useEffect(() => {
        const isValidAssignment = assignField.isAssignedToMe || (assignField.selectedRole && assignField.selectedMember);
        setIsAssignmentComplete(isValidAssignment);
    }, []);

    useEffect(() => {
        if (assignField.isAssignedToMe && user?._id) {
            setAssignField(prev => ({
                ...prev,
                selectedMember: user._id,
                selectedRole: null
            }));
        }
        else {
            setAssignField(prev => ({
                ...prev,
                selectedMember: null,
                selectedRole: null
            }));
        }
    }, [assignField.isAssignedToMe, user?._id]);

    return (

        <div className='flex flex-col gap-4'>
            <h1 className='text-gray font-semibold text-lg'>Assign To:</h1>

            <div>
                <div className='flex gap-4'>
                    <div className='flex flex-col w-full gap-1'>
                        <h2 className='font-semibold text-gray'>Role <span className='text-red-600'>*</span></h2>
                        <CustomDropdown
                            id="role"
                            name="selectedRole"
                            value={assignField.selectedRole}
                            onChange={handleInputChange}
                            className="w-full"
                            options={roles}
                            disabled={isAssignmentComplete || assignField.isAssignedToMe}
                        />
                    </div>

                    <div className='flex flex-col w-full gap-1'>
                        <h2 className='font-semibold text-gray'>Member <span className='text-red-600'>*</span></h2>
                        <CustomDropdown
                            id="member"
                            name="selectedMember"
                            value={assignField.isAssignedToMe ? user?._id : assignField.selectedMember}
                            onChange={handleInputChange}
                            className="w-full"
                            options={selectedRoleMembers}
                            disabled={isAssignmentComplete || assignField.isAssignedToMe}
                        />
                    </div>
                </div>
                <div className='flex items-center gap-2'>
                    <Checkbox
                        name="assignToMe"
                        checked={assignField.isAssignedToMe}
                        onChange={handleAssignToMe}
                        disabled={isAssignmentComplete}
                    />
                    <span className={isAssignmentComplete ? 'text-gray-400' : ''}>Assign to me</span>
                </div>
            </div>
        </div>
    );
}