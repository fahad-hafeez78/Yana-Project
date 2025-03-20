import React from 'react';
import downloadfile from "../../assets/download file.svg"
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import ParticipantsChangesTable from '../../components/participants/participantsChangesTable/ParticipantsChangesTable.jsx';

const ParticipantChanges = () => {

  return (
    // <div className="p-5">
    <div className="grid gap-5">
      <div className="flex justify-end items-center">

        <ButtonWithIcon
          onClick={() => { /* handle download */ }}
          icon={<img src={downloadfile} alt="download file" width={18} height={18} />}
          text="Download"
          className="bg-red-600 text-white px-3 py-2 rounded-full"
        />
      </div>
      <ParticipantsChangesTable />

    </div>

    // </div>
  );
};

export default ParticipantChanges;