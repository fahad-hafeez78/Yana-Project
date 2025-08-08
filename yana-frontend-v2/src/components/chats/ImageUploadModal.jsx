import { useEffect, useState } from "react";
import CrossButton from "../../elements/crossButton/CrossButton";
import ButtonWithIcon from "../../elements/buttonWithIcon/ButtonWithIcon";

export default function ImageUploadModal({ selectedImage, onCancel, onConfirm, newMessage, setnewMessage }) {
    const [displaySelectedFile, setDisplaySelectedFile] = useState();
    const [fileType, setFileType] = useState('image');

    useEffect(() => {
        const objectUrl = URL.createObjectURL(selectedImage);
        setDisplaySelectedFile(objectUrl);
        
        // Determine file type
        if (selectedImage?.type?.includes('image')) {
            setFileType('image');
        } else {
            setFileType('document');
        }
    }, [selectedImage]);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-4 w-[50vw] relative max-w-md">
                {/* Close Button */}
                <button
                    className="absolute top-3 right-3 text-gray hover:text-gray-dark"
                    onClick={onCancel}
                >
                    <CrossButton />
                </button>

                <div className="flex flex-col justify-center gap-4">
                    {fileType === 'image' ? (
                        <img 
                            src={displaySelectedFile} 
                            alt="Preview" 
                            className="rounded-lg h-[40vh] max-h-md " 
                        />
                    ) : (
                        <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg">
                            <div className="text-lg font-medium mb-2">Document Preview</div>
                            <div className="text-sm text-gray mb-4">
                                {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                            </div>
                           
                        </div>
                    )}

                    <div className="relative">
                        <textarea
                            placeholder="Add message (optional)..."
                            value={newMessage}
                            onChange={(e) => setnewMessage(e.target.value)}
                            className="w-full resize-none py-2 px-3 rounded-md bg-gray-100 border outline-none focus:border-gray-200 focus:ring-1 focus:ring-gray"
                            rows={3}
                        />
                    </div>
                </div>

                <div className="flex justify-center space-x-4 mt-4">
                    <ButtonWithIcon
                        onClick={onCancel}
                        variant="discard"
                        text="Cancel"
                    />
                    <ButtonWithIcon
                        onClick={onConfirm}
                        text="Send"
                        variant="confirm"
                    />
                        
                </div>
            </div>
        </div>
    );
}