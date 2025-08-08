import AllRiders from "../../components/riders/riders/AllRiders"
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";
import AddMealIcon from '../../assets/customIcons/generalIcons/AddCircle.svg';
import { useNavigate } from "react-router-dom";
import usePermissionChecker from "../../util/permissionChecker/PermissionChecker";

export default function Riders() {

    const navigate = useNavigate();
    const checkPermission = usePermissionChecker();
    const isCreatePermission = checkPermission('rider', 'create');
    const isEditPermission = checkPermission('rider', 'edit');
    const isDeletePermission = checkPermission('rider', 'delete');

    return (
        <div className="flex flex-col h-full gap-5">
            {isCreatePermission && <div className="flex gap-3 justify-end items-center">
                <ButtonWithIcon
                    onClick={() => navigate('/riders/add-rider')}
                    icon={<img src={AddMealIcon} alt="import file" width={24} height={24} />}
                    text="Add Rider"
                    variant="primary"
                />
            </div>}

            <AllRiders isCreatePermission={isCreatePermission} isEditPermission={isEditPermission} isDeletePermission={isDeletePermission} />

        </div>
    );
}
