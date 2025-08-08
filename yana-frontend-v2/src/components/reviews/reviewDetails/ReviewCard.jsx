import moment from "moment";
import ImageModal from '../../../elements/imageModal/ImageModal';

export default function ReviewCard({ review, tabCurrentStatus }) {
    const staticImage = tabCurrentStatus === 'rider_reviews'
        ? '/rider.jpg'
        : '/customer_support.jpg';

    // Theme based on your color palette
    const theme = {
        bg: 'bg-beige-light', // Using your beige light color
        border: 'border-secondary-light', // Using your secondary light color
        header: 'bg-beige', // Using your default beige color
        text: 'text-primary' // Using your primary default color
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const totalStars = 5;
        let stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`} className="text-2xl text-secondary">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="text-2xl text-secondary-light">☆</span>);
        }

        const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-2xl text-gray-light">★</span>);
        }

        return (
            <div className="relative inline-block">
                <div className="flex">
                    {stars}
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col md:flex-row border ${theme.border} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 ${theme.bg} h-full`}>
            {/* Reviewer Info Section */}
            <div className={`flex flex-col items-center p-2 ${theme.header} md:w-40 md:min-w-40`}>
                <div className="relative mb-3">
                    <ImageModal
                        imageUrl={review?.photo || staticImage}
                        imageText={review?.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    {review?.rating && (
                        <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                            <div className="bg-white rounded-full px-2 py-1 shadow-xs flex items-center">
                                <span className="text-secondary text-sm font-bold">
                                    {review.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <p className="font-bold text-gray-dark truncate max-w-[120px]">{review?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray mt-1">
                        {moment(review.createdAt).format("MM-DD-YYYY")}
                    </p>
                </div>

                <div className="mt-3">
                    {renderStars(review?.rating || 0)}
                </div>
            </div>

            {/* Review Content Section */}
            <div className="flex flex-col flex-grow p-4">
                <div className="flex items-center mb-2">
                    <span className={`font-bold ${theme.text} uppercase text-sm`}>Feedback</span>
                </div>

                <div className={`flex-grow rounded-lg bg-white border ${theme.border} overflow-hidden`}>
                    <textarea
                        readOnly
                        value={review?.review_text || "No review text provided"}
                        className={`w-full h-full p-3 text-gray-dark resize-none focus:outline-none focus:ring-0 border-none bg-transparent min-h-[100px] text-sm leading-snug`}
                    />
                </div>
            </div>
        </div>
    );
}