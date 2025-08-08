import { useLocation, useNavigate } from "react-router-dom";
import CrossButton from "../../../elements/crossButton/CrossButton";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import reviewsMiddleware from "../../../redux/middleware/reviewsMiddleware";
import Tabs from "../../../elements/tabs/Tabs";
import Spinner from "../../../elements/customSpinner/Spinner";
import ReviewCard from "./ReviewCard";
import ParticipantInfoItem from "./ParticipantInfoItem";
import moment from "moment";
import ParticipantInfoIcon from "../../../assets/customIcons/reviewsIcons/ParticipantInfoIcon.jsx";
import usePermissionChecker from "../../../util/permissionChecker/PermissionChecker.jsx";



export default function ReviewDetails() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const location = useLocation();
  const { participantId } = location?.state || {};

  const [allReviews, setAllReviews] = useState([]);
  const [singleReviewInfo, setSingleReviewInfo] = useState(null);

  const [tabCurrentStatus, setTabCurrentStatus] = useState('meal_reviews');
  const [isLoading, setIsLoading] = useState(true);

  const checkPermission = usePermissionChecker();
  const isViewSupportReviewPermssions = checkPermission('review', 'supportReview');

  const tabs = [
    { value: 'meal_reviews', label: 'Meals', activeClass: 'text-grey-500' },
    { value: 'rider_reviews', label: 'Riders', activeClass: 'text-green' },
    ...(isViewSupportReviewPermssions
      ? [{ value: 'support_reviews', label: 'Customer Support', activeClass: 'text-red' }]
      : []),
  ];

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        const response = await dispatch(reviewsMiddleware.GetReviewsByParticipantId(participantId));
        setAllReviews(response?.reviews);
      } catch (error) {

      }
      finally {
        setIsLoading(false)
      }
    }
    if (participantId) fetchReviewDetails()
  }, [participantId]);

  useEffect(() => {
    setSingleReviewInfo(allReviews?.[tabCurrentStatus]);
  }, [tabCurrentStatus, allReviews]);

  return (
    <div className="bg-white p-5 rounded-2xl h-full flex flex-col">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Review Details</h1>
        <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
      </div>

      <div className="flex flex-col flex-grow min-h-0">
        <div className="bg-beige-light p-5 rounded-xl mb-6 border border-beige-dark">

          <h3 className="text-primary font-semibold text-lg mb-2 flex items-center">
            <ParticipantInfoIcon className="w-5 h-5 mr-2" />
            Participant Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ParticipantInfoItem
              label="Participant Name"
              value={allReviews?.customer?.name}
              accentColor="#0E6D99"
            />
            <ParticipantInfoItem
              label="Participant ID"
              value={allReviews?.customer?.customer_id}
              accentColor="#0E6D99"
            />
            <ParticipantInfoItem
              label="Vendor"
              value={allReviews?.customer?.vendorId?.name}
              accentColor="#0E6D99"
            />
            {/* <ParticipantInfoItem
                  label="Date"
                  value={moment(allReviews?.date).format("MMM D, YYYY")}
                  accentColor="#0E6D99"
                /> */}
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-4">
          <Tabs
            tabs={tabs}
            activeTab={tabCurrentStatus}
            onTabChange={setTabCurrentStatus}
          />
        </div>

        {/* Reviews Content Area */}
        {isLoading ? <Spinner /> :
          <div className="flex-grow overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoading ? <Spinner /> :
                singleReviewInfo?.length > 0 ? (
                  singleReviewInfo?.map((review, index) => (
                    <ReviewCard
                      review={review}
                      tabCurrentStatus={tabCurrentStatus}
                      key={index}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-8">
                    <img
                      src="/No data found.jpg"
                      alt="No data found"
                      className="max-h-[220px] object-contain"
                    />
                  </div>
                )}
            </div>
          </div>
        }

      </div>
    </div>
  );
}