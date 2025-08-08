import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { usePaginationController } from "../../util/PaginationFilteredData/PaginationController.jsx";
import { usePaginatedData } from "../../util/PaginationFilteredData/PaginatedData.jsx";
import Table from "../../elements/table/Table";
import EyeIcon from '../../assets/customIcons/generalIcons/EyeIcon.svg';
import reviewsMiddleware from "../../redux/middleware/reviewsMiddleware";
import moment from "moment";

export default function Reviews() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Pagination
    const { currentPage, setCurrentPage, itemsPerPage } = usePaginationController('page', 100);

    // Data state
    const [allReviews, setAllReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Paginated data
    const paginatedReviews = usePaginatedData(allReviews, currentPage, itemsPerPage);
    const [displayReviews, setDisplayReviews] = useState(paginatedReviews);

    const columns = [
        { key: 'name', header: 'Participants Name' },
        { key: 'customer_id', header: 'Participants Id' },
        { key: 'vendorId.name', header: 'Vendor' },
        {
            key: 'latestReviewDate', 
            header: 'Latest Review',
            accessor: (row) => moment(row.latestReviewDate).format('MM-DD-YYYY'),
        },
        {
            key: 'details',
            header: 'Details',
            accessor: (row) => (
                <button 
                    onClick={() => navigate('/reviews/review-details', { 
                        state: { participantId: row?._id } 
                    })} 
                    className="py-3 px-5"
                >
                    <img src={EyeIcon} alt="View" width={18} height={18} />
                </button>
            ),
        },
    ];

    useEffect(() => {
        fetchReviews();
    }, []);

    useEffect(() => {
        setDisplayReviews(paginatedReviews);
    }, [paginatedReviews]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);
            const response = await dispatch(reviewsMiddleware.GetAllReviews());
            if (response?.success) {
                setAllReviews(response?.customers || []);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Derived values
    const totalPages = Math.ceil(allReviews.length / itemsPerPage);

    return (
        <Table
            tableTitle="Participants Reviews"
            columns={columns}
            rows={displayReviews}

            searchBarData={paginatedReviews}
            searchBarSetData={setDisplayReviews}
            
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={allReviews.length}
            isLoading={isLoading}
        />
    );
}