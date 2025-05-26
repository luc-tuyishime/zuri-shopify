export function WigGuideSection() {
    return (
        <div className="wig-guide-section bg-white py-16">
            <div className="container mx-auto px-14">
                {/* Top section with title and description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Left side - Title */}
                    <div>
                        <h2 className="text-[45px] font-poppins font-regular text-[#000000] leading-tight">
                            HOW TO CHOOSE THE PERFECT WIG FOR YOU
                        </h2>
                    </div>

                    {/* Right side - Description */}
                    <div className="flex items-center">
                        <p className="text-[19px] font-poppins font-regular text-[#542C17] leading-relaxed">
                            Discover confidence with our premium wigs, designed for style, comfort,
                            and a natural look. Whether you're seeking a bold transformation or
                            everyday elegance, our diverse collection offers the perfect match for you.
                            Experience lightweight, breathable designs crafted for all-day wear.
                        </p>
                    </div>
                </div>

                {/* Steps section */}
                <div className="steps-container">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="step-card relative">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: "url('')",
                                    backgroundColor: '#E8B4A0'
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium">
                  1. Wear the wig
                </span>

                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="step-card relative">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: "url('')",
                                    backgroundColor: '#D4A574'
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium">
                  2. Adjust the band
                </span>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="step-card relative">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: "url('')",
                                    backgroundColor: '#5C2E1C'
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium">
                  3. Cut the lace
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom row - 1 centered step */}
                    <div className="flex justify-center">
                        <div className="step-card relative w-full md:w-5/6 lg:w-2/3 xl:w-3/5">
                            <div
                                className="w-full h-80 bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: "url('')",
                                    backgroundColor: '#E8C4A0'
                                }}
                            >
                                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                <span className="relative z-10 text-white text-xl font-poppins font-medium">
                4. Finished look!
            </span>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}