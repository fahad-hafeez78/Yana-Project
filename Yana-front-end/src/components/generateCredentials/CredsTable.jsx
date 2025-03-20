import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
// import { fetchActiveInactiveCustomers } from '../../redux/actions/customerActions';
import SearchBar from '../../elements/searchBar/SearchBar';
import SortDropdown from '../../elements/sortDropdown/SortDropdown';
import DetailsIcon from '../../assets/details.svg';
import NextIcon from '../../assets/customIcons/generalIcons/details.svg';

function CredsTable() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { activeInactiveCustomers } = useSelector(state => state.customer);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(4);

    useEffect(() => {
        // dispatch(fetchActiveInactiveCustomers());
    }, [dispatch]);

    useEffect(() => {
        if (activeInactiveCustomers) {
            setFilteredCustomers(activeInactiveCustomers);
        }
    }, [activeInactiveCustomers]);
    
    const indexOfLastCustomer = currentPage * entriesPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - entriesPerPage;
    const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const totalPages = Math.ceil(filteredCustomers.length / entriesPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleChangeCredsClick = (member) => {
        // navigate('/dashboard/customers-details', { state: { memberData: member } });
    };

    const sortOptions = [
        { value: 'newest', label: 'Sort by: Newest' },
        { value: 'oldest', label: 'Sort by: Oldest' },
    ];

    return (
        <div className="bg-white rounded-2xl p-6 font-poppins">
            <div className="flex justify-between items-center mb-6">
                <div className="htext">
                    <h2 className="text-2xl font-semibold">Customers</h2>
                    <h5 className="text-green-500 font-medium">Active Members</h5>
                </div>
                <div className="flex items-center space-x-4">
                    <SearchBar Data={activeInactiveCustomers} setData={setFilteredCustomers} searchKey="Name" className='h-8 bg-gray-100 border border-gray-100 rounded-md px-2' />
                    <SortDropdown Data={activeInactiveCustomers} setData={setFilteredCustomers} options={sortOptions} />
                </div>
            </div>

            {filteredCustomers.length === 0 ? (
                <p>No customers found.</p>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="text-left text-gray-500 font-medium py-3 px-5">Username</th>
                            <th className="text-left text-gray-500 font-medium py-3 px-5">Password</th>
                            <th className="text-left text-gray-500 font-medium py-3 px-5">MemberID</th>
                            <th className="text-left text-gray-500 font-medium py-3 px-5">MedicaidID</th>
                            <th className="text-left text-gray-500 font-medium py-3 px-5">Name</th>
                            <th className="text-center text-gray-500 font-medium py-3 px-5">Phone</th>
                            <th className="text-left text-gray-500 font-medium py-3 px-5">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCustomers.map((customer) => (
                            <tr key={customer._id.toString()} className="border-t border-gray-200 border-b">
                                <td className="text-left py-3 px-5">{customer.Username}</td>
                                <td className="text-left py-3 px-5">{"Password123"}</td>
                                <td className="text-left py-3 px-5">{customer.MemberID}</td>
                                <td className="text-left py-3 px-5">{customer.MedicaidID}</td>
                                <td className="text-left py-3 px-5">{customer.Name}</td>
                                <td className="text-left py-3 px-5">{customer.Phone}</td>
                                <td className="text-left py-3 px-5">
                                    <button onClick={() => handleChangeCredsClick(customer)} className={`inline-block py-1 px-4 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-600'`}>
                                        Change
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div className="flex justify-between items-center mt-4">
                <div className="mt-4">
                    Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} entries
                </div>
                <div className="flex items-center justify-end space-x-2">
                    <button onClick={handlePrevPage} className="bg-gray-100 text-white px-2 py-2 rounded-full" disabled={currentPage <= 1}>
                        <img src={NextIcon} alt="prev-icon" className="w-5 h-5 transform scale-x-[-1]" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`px-3 py-1 rounded-full ${currentPage === i + 1 ? 'bg-[#fe8c00] text-white' : 'bg-gray-100 text-black'}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={handleNextPage} className="bg-gray-100 text-white px-2 py-2 rounded-full" disabled={currentPage >= totalPages}>
                        <img src={NextIcon} alt="next-icon" className="w-5 h-5 transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CredsTable;
