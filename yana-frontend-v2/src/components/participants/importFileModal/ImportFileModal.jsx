import React, { useState } from 'react';
import { apiPost } from "../../../config/axiosIntance";
import { useDispatch } from 'react-redux';
import customersMiddleware from '../../../redux/middleware/customersMiddleware';
import { showErrorAlert } from '../../../redux/actions/alertActions';
import Spinner from '../../../elements/customSpinner/Spinner';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon';
// import Spinner from '../customSpinner/Spinner';

const ImportFileModal = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) {
      dispatch(showErrorAlert('Please select a file before importing.'));
      return;
    }

    setLoading(true); // Start spinner
    const formData = new FormData();
    formData.append('importFile', file);

    try {
      const response = await dispatch(customersMiddleware.ImportCustomersDataFile(formData));
      if (response.success) onClose();
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1050]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-dark">Import File</h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spinner /> {/* Spinner component displayed while loading */}
          </div>
        ) : (
          <>
            <div className="file-upload-area border-2 border-dashed border-gray-light p-4 mb-4 text-center rounded-lg hover:border-blue-500">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="py-1 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer"
              />
              <p className="mt-2 text-sm text-gray">Drag or click to upload</p>
            </div>

            {file && (
              <div className="file-info mb-4 text-gray-600">
                <p className="font-medium">Selected File:</p>
                <p>{file.name}</p>
              </div>
            )}

            <div className="modal-actions flex justify-end space-x-4 mt-4">
              <ButtonWithIcon
                onClick={onClose}
                text="Cancel"
                variant='discard'
              />
              <ButtonWithIcon
                onClick={handleImport}
                text="Import File"
                variant='confirm'
              />
                
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportFileModal;
