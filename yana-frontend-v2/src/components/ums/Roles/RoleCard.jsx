import { useNavigate } from "react-router-dom"
import TrashIcon from '../../../assets/customIcons/generalIcons/trash.svg';
import umsMiddleware from "../../../redux/middleware/umsMiddleware";
import { useState } from "react";
import UserDeleteModal from "../userDeleteModal/UserDeleteModal";
import { useDispatch } from "react-redux";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";

export default function RoleCard({ role, fetchAllRoles }) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setisDeleteModalOpen] = useState(false);

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setisDeleteModalOpen(true);
    };

    const handleDeleteCancel = (e) => {
        e.stopPropagation();
        setisDeleteModalOpen(false);
    };

    const handleModifyPageName = (pageName) => {
        if (pageName === 'participant_changes') {
            return 'Participant Changes'
        }
        else if (pageName === 'participant_requests') {
            return 'Participant Requests'
        }
        else if (pageName === 'TrackingRoute') {
            return 'Tracking Route'
        }
        else if (pageName === 'soft_delete') {
            return 'Soft Delete'
        }
        else
            return capitalizeFirstLetter(pageName)
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        try {
            const response = await dispatch(umsMiddleware.DeleteRole(role?._id));

            if (response.success) {
                setisDeleteModalOpen(false);
                fetchAllRoles();
            } else {
                setisDeleteModalOpen(false);
                console.error('Error deleting role');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
        }
    };

    return (
        <div
            className="flex flex-col rounded-lg shadow-sm p-2 cursor-pointer max-h-[220px] border gap-2 group hover:border-gray-light transition-colors"
            role='button'
            onClick={() => navigate('edit-role', { state: { role: role } })}
        >
            <div className="flex justify-between">
                <h3 className="text-lg font-semibold truncate">{capitalizeFirstLetter(role?.name)}</h3>
                <button
                    className=""
                    onClick={handleDeleteClick}
                >
                    <img src={TrashIcon} alt="Delete" width={16} height={16} />
                </button>

            </div>

            <div className="flex flex-col">
                <label><span className="font-semibold">Users: </span>{role?.userCounts}</label>
                <p><span className="font-semibold">Created by: </span>{role?.parentUser?.name}</p>
            </div>

            <div className="flex flex-col">
                <label className="text-lg font-semibold">Permissions</label>
                <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto py-1">
                    {role?.permissions.map((permissions, index) => (
                        <span key={index} className="px-3 py-1 rounded-full text-sm text-center border-2 border-primary bg-secondary text-white font-semibold">
                            {handleModifyPageName(permissions?.page)}
                        </span>
                    ))}
                </div>
            </div>

            {isDeleteModalOpen && (
                <UserDeleteModal
                    umsType="role"
                    onConfirm={handleDelete}
                    onCancel={handleDeleteCancel}
                    userName={role?.name}
                />
            )}
        </div>
    )
}