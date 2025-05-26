import IMAGE from '../assets/image.png';

export function CustomerReviewsSection() {
    const reviews = [
        {
            id: 1,
            image: IMAGE,
            rating: 5,
            text: "Leaves my hair looking and feeling amazing, with a noticeable shine and softness.",
            name: "ANDREA C.",
            verified: true
        },
        {
            id: 2,
            image: IMAGE,
            rating: 5,
            text: "Leaves my hair looking and feeling amazing, with a noticeable shine and softness.",
            name: "ANDREA C.",
            verified: true
        },
        {
            id: 3,
            image: IMAGE,
            rating: 5,
            text: "Leaves my hair looking and feeling amazing, with a noticeable shine and softness.",
            name: "ANDREA C.",
            verified: true
        },
        {
            id: 4,
            image: IMAGE,
            rating: 5,
            text: "Leaves my hair looking and feeling amazing, with a noticeable shine and softness.",
            name: "ANDREA C.",
            verified: true
        }
    ];

    // Star rating component
    const StarRating = ({ rating }) => {
        return (
            <div className="flex items-center mb-3">
                {[...Array(5)].map((_, index) => (
                    <svg
                        key={index}
                        className={`w-4 h-4 ${index < rating ? 'text-[#542C17]' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    // Verified badge icon
    const VerifiedIcon = () => (
        <svg className="w-5 h-5 text-[#542C17] ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );

    return (
        <div className="customer-reviews-section bg-white py-16">
            <div className="container mx-auto px-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left side - Title and Button */}
                    <div>
                        <h2 className="text-[45px] font-poppins font-medium leading-tight mb-8">

                            Check out what our customers are saying <br /> about our products

                        </h2>
                        <button className="border border-gray-800 text-gray-800 px-8 py-3 font-poppins font-medium hover:bg-gray-800 hover:text-white transition-colors duration-300">
                            READ ALL REVIEWS
                        </button>
                    </div>

                    {/* Right side - Reviews Grid */}
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    {/* Review Image */}
                                    <div className="mb-4">
                                        <img
                                            src={review.image}
                                            alt={`Review by ${review.name}`}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />
                                    </div>

                                    <StarRating rating={review.rating} />

                                    <p className="text-sm font-poppins text-gray-700 mb-4 leading-relaxed">
                                        "{review.text}"
                                    </p>

                                    <div className="flex items-center">
                    <span className="text-sm font-poppins font-medium text-gray-900">
                      {review.name}
                    </span>
                                        {review.verified && <VerifiedIcon />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}