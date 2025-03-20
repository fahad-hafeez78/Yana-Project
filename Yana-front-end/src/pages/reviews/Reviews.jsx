import { useState, useEffect } from "react";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';

import Table from "../../elements/table/Table";
import ReviewModal from "../../components/reviews/reviewModal/ReviewModal";
import { useDispatch } from "react-redux";
import reviewsMiddleware from "../../redux/middleware/reviewsMiddleware";

export default function Reviews() {
    const dispatch = useDispatch();

    const [allReviews, setallReviews] = useState([])
    const [filteredReviews, setFilteredReviews] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [selectedReview, setSelectedReview] = useState(null); // State for storing selected review

    const [isLoading, setisLoading] = useState(true);


    const openModal = (review) => {
        setSelectedReview(review); // Set the selected review to state
        setIsModalOpen(true); // Open the modal
    };


    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
        setSelectedReview(null); // Reset the selected review
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    const displayedReviews = filteredReviews.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const columns = [
        { key: 'Name', header: 'Participants Name' },
        { key: 'Phone', header: 'Phone' },
        { key: 'VendorName', header: 'Vendor' },
    ];

    const sortOptions = [
        { value: 'oldest', label: 'Sort by: Oldest' },
        { value: 'newest', label: 'Sort by: Newest' },
    ];

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await dispatch(reviewsMiddleware.GetAllReviews());
                if (response.success) {
                    setallReviews(response.data)
                    setFilteredReviews(response.data)
                } else {
                    console.error("Error Fetching Vendors");
                }
            } catch (error) {
                console.error("Error Fetching Vendors:", error);
            }
            finally {
                setisLoading(false); // Hide spinner
            }
        };


        fetchReviews();
    }, []);

    return (
        // <div className="p-6">
        <>
            <Table
                tableTitle="Participants Reviews"
                tableSubTitle=""

                columns={columns}
                rows={displayedReviews}

                secondlastColumnName="Date"
                lastColumnName="Details"

                searchBarData={allReviews}
                searchBarSetData={setFilteredReviews}
                searchBarKey="Name"
                searchBarclassName='h-8 bg-gray-100 border border-gray-100 rounded-md px-2'

                sortDropdownData={allReviews}
                sortDropdownSetData={setFilteredReviews}
                sortDropdownOptions={sortOptions}

                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredReviews.length}

                tableHeight="h-[calc(100vh-240px)]"
                isLoading={isLoading}


            >
                {(review) => (
                    <>
                        <td className="py-3 px-5 flex">
                            {formatDate(review.createdAt)}
                        </td>

                        <td className="py-3 px-5">
                            <button onClick={() => openModal(review)}>
                                <img src={EyeIcon} alt="View" width={18} height={18} />
                            </button>
                        </td>
                    </>
                )}

            </Table>
            <ReviewModal isOpen={isModalOpen} onClose={closeModal} review={selectedReview} />
            {/* // </div> */}
        </>
    )

}