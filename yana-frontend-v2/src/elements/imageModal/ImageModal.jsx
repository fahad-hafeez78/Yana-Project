import { useEffect, useState, useRef } from "react";
import CrossButton from "../crossButton/CrossButton";

const ImageModal = ({ imageUrl, modalImageUrl, imageText, className }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const modalRef = useRef(null);
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsModalOpen(false);
        }
    };

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            setIsModalOpen(false);
        }
    };

    useEffect(() => {
        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    return (
        <>
            {imageUrl &&
                !(Array.isArray(imageUrl) && (imageUrl.length === 0 || imageUrl[0] === '')) ? <img
                    src={imageUrl}
                    alt={imageText || "Modal image"}
                    className={`cursor-pointer hover:scale-[1.01] ${className || "w-10 h-10 rounded-full object-cover"}`}
                    onClick={() => setIsModalOpen(true)}
                />:"No image"}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div
                        ref={modalRef}
                        className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between py-2 px-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900 truncate max-w-[80%]">
                                {imageText || 'Image Preview'}
                            </h3>
                            <CrossButton
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray hover:text-gray-dark transition-colors duration-200"
                            />
                        </div>
                        <div className="p-4 flex justify-center items-center">
                            <img
                                src={modalImageUrl || imageUrl}
                                alt={imageText || "Modal image"}
                                className="max-h-[80vh] w-auto max-w-full object-cover rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageModal;