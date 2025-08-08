import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { usePaginationController } from '../../util/PaginationFilteredData/PaginationController.jsx';
import { usePaginatedData } from '../../util/PaginationFilteredData/PaginatedData.jsx';
import Table from '../../elements/table/Table';
import persMiddleware from '../../redux/middleware/persMiddleware';
import statusStyles from '../../util/statusStyles/StatusStyles';
import capitalizeFirstLetter from '../../util/capitalizeFirstLetter/CapitalizeFirstLetter';
import CustomDropdown from '../../elements/customDropdown/CustomDropdown';
import customersMiddleware from '../../redux/middleware/customersMiddleware';

const tabs = [
  { value: 'all', label: 'All', activeClass: 'text-grey-500' },
  { value: 'active', label: 'Active', activeClass: 'text-green' },
  { value: 'inactive', label: 'Inactive', activeClass: 'text-red' },
  { value: 'empty', label: 'Empty', activeClass: 'text-blue' },
  { value: 'unassigned', label: 'Unassigned', activeClass: 'text-yellow-500' },
];

const Pers = () => {
  const dispatch = useDispatch();

  // Pagination
  const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

  // Data state
  const [persParticipants, setPersParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Tab state with search params
  const [searchParams, setSearchParams] = useSearchParams();
  const [tabCurrentStatus, setTabCurrentStatus] = useState(searchParams.get('tab') || 'all');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== tabCurrentStatus) {
      setTabCurrentStatus(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (tabCurrentStatus !== 'all') params.tab = tabCurrentStatus;
    if (currentPage !== 1) params.page = currentPage;
    
    setSearchParams(params);
  }, [tabCurrentStatus, currentPage]);

  // Paginated data
  const paginatedParticipants = usePaginatedData(persParticipants, currentPage, itemsPerPage);
  const [displayParticipants, setDisplayParticipants] = useState(paginatedParticipants);

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'memberId', header: 'Member Id' },
    { key: 'insurance.mealPlan', header: 'Meal Plan' },
    { key: 'insurance.pcpt', header: 'Pers CPT' },
    {
      key: 'status', 
      header: 'Participant Status',
      accessor: (row) => (
        <div className="py-2 flex items-center">
          <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[capitalizeFirstLetter(row?.status)] || statusStyles.default}`}>
            {capitalizeFirstLetter(row?.status)}
          </span>
        </div>
      )
    },
    {
      key: 'pers_status', 
      header: 'Device Status',
      accessor: (row) => (
        <div className="py-2 pr-5 flex">
          <CustomDropdown
            id="status"
            name="status"
            className={statusStyles[capitalizeFirstLetter(row?.pers_status)]}
            value={row.pers_status}
            onChange={(e) => changePerStatus(e, row)}
            placeholder="Select Status"
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "empty", label: "Empty" },
              { value: "unassigned", label: "Unassigned" },
            ]}
          />
        </div>
      )
    },
  ];

  useEffect(() => {
    fetchPersParticipants();
  }, [tabCurrentStatus]);

  useEffect(() => {
    setDisplayParticipants(paginatedParticipants);
  }, [paginatedParticipants]);

  const fetchPersParticipants = async () => {
    try {
      setIsLoading(true);
      const response = await dispatch(persMiddleware.GetPersParticipants(tabCurrentStatus));

      if (response?.success) {
        setPersParticipants(response?.customers || []);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const changePerStatus = async (e, row) => {
    e.preventDefault();
    const { value } = e.target;
    try {
      const payload = {
        pers_status: value,
      };
      setIsLoading(true);
      const response = await dispatch(customersMiddleware.UpdateCustomer(row?._id, payload));

      if (response.success) {
        fetchPersParticipants();
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Derived values
  const totalPages = Math.ceil(persParticipants.length / itemsPerPage);

  return (
    <div className="flex flex-col h-full gap-5">
      <Table
        tableTitle="Pers"
        columns={columns}
        rows={displayParticipants}
        tabs={tabs}
        filterStatus={tabCurrentStatus}
        setFilterStatus={setTabCurrentStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={persParticipants.length}
        searchBarData={paginatedParticipants}
        searchBarSetData={setDisplayParticipants}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Pers;