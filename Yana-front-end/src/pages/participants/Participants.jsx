import React, { useEffect, useState } from 'react';
import importfile from "../../assets/import file.svg"
import downloadfile from "../../assets/download file.svg"
import AddMealIcon from '../../assets/plus-circle-white.svg';
import ButtonWithIcon from '../../elements/buttonWithIcon/ButtonWithIcon.jsx';
import ImportFileModal from '../../components/participants/importFileModal/ImportFileModal.jsx';
import ParticipantsAllTabs from '../../components/participants/participantsAllTabs/ParticipantsAllTabs.jsx';
import { useDispatch } from 'react-redux';
import customersMiddleware from '../../redux/middleware/customersMiddleware.js';
import * as XLSX from 'xlsx';
import { showErrorAlert } from '../../redux/actions/alertActions.js';
import { useLocation, useNavigate } from 'react-router-dom';

const Participants = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const location=useLocation()
  const [showImportModal, setShowImportModal] = useState(false);
  // const [isImportSuccess, setisImportSuccess] = useState(false);

  // const [showClientForm, setShowClientForm] = useState(false);
  const [activeCustomers, setActiveCustomers] = useState([]);

  // const handleClientFormClose = () => {
  //   setShowClientForm(false);
  // };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await dispatch(customersMiddleware.GetAllCustomers());
        setActiveCustomers(response.data)
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, [dispatch, location.state?.refresh]);


  const handleDownload = () => {

    if (activeCustomers.length === 0) {
      dispatch(showErrorAlert("No data available for download."))
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(activeCustomers); // Convert JSON to worksheet
    const workbook = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Active Customers"); // Append worksheet
    // Export as Excel file
    XLSX.writeFile(workbook, "CustomersDataFile.xlsx");
  };


  return (
    // <div className="p-5">
    <div className="grid gap-5">
      <div className="flex gap-3 justify-end items-center">
        {/* Uncomment this to add a customer */}

        <ButtonWithIcon
          onClick={() => setShowImportModal(true)}
          icon={<img src={importfile} alt="import file" width={18} height={18} />}
          text="Import File"
          className="bg-custom-blue text-white px-3 py-2 rounded-full"
        />

        <ButtonWithIcon
          onClick={() => navigate('/participants/add-participant')}
          icon={<img src={AddMealIcon} alt="import file" width={24} height={24} />}
          text="Add Participant"
          className="bg-custom-blue text-white px-3 py-2 rounded-full"
        />

        <ButtonWithIcon
          onClick={handleDownload}
          icon={<img src={downloadfile} alt="download file" width={18} height={18} />}
          text="Download"
          className="bg-red-600 text-white px-3 py-2 rounded-full"
        />
      </div>
      <ParticipantsAllTabs />
      {showImportModal && <ImportFileModal onClose={() => {setShowImportModal(false), navigate('/participants', { state: { refresh: true } })}} />}

    </div>
    

  );
};

export default Participants;
