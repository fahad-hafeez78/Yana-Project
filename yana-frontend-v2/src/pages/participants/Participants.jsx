import { useState } from 'react';
import importfile from "../../assets/customIcons/generalIcons/import file.svg"
import AddMealIcon from '../../assets/customIcons/generalIcons/AddCircle.svg';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import ImportFileModal from '../../components/participants/importFileModal/ImportFileModal.jsx';
import ParticipantsAllTabs from '../../components/participants/participantsAllTabs/ParticipantsAllTabs.jsx';
import { useNavigate } from 'react-router-dom';
import usePermissionChecker from '../../util/permissionChecker/PermissionChecker.jsx';

const Participants = () => {
  const navigate = useNavigate();

  const [showImportModal, setShowImportModal] = useState(false);
  const checkPermission = usePermissionChecker();

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex gap-3 justify-end items-center">
        {checkPermission('participant', 'import') &&
          <ButtonWithIcon
            onClick={() => setShowImportModal(true)}
            icon={<img src={importfile} alt="import file" width={18} height={18} />}
            text="Import File"
            variant='secondary'
          />}
        {checkPermission('participant', 'create') &&
          <ButtonWithIcon
            onClick={() => navigate('/participants/participant-fields', { state: { isEditable: true, actionType:"add-participant" } })}
            icon={<img src={AddMealIcon} alt="import file" width={24} height={24} />}
            text="Add Participant"
            variant='primary'
          />}
      </div>
      <ParticipantsAllTabs />
      {showImportModal && <ImportFileModal onClose={() => { setShowImportModal(false), navigate('/participants') }} />}
    </div>
  );
};

export default Participants;
