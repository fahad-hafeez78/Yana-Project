import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import OwnMessage from '../../chats/ChatBox/OwnMessage';
import OpponentMessage from '../../chats/ChatBox/OpponentMessage';
import { useDispatch, useSelector } from 'react-redux';
import ChatInputField from '../../chats/ChatBox/ChatInputField';
import EmojiPicker from 'emoji-picker-react';
import ImageUploadModal from '../../chats/ImageUploadModal';
import ButtonWithIcon from '../../../elements/buttonWithIcon/ButtonWithIcon';
import { showErrorAlert } from '../../../redux/actions/alertActions';
import TicketExpandableInformation from './TicketExpandableInformation';
import ticketsMiddleware from '../../../redux/middleware/ticketsMiddleware';
import CrossButton from '../../../elements/crossButton/CrossButton';
import AssignTicket from './AssignTicket';
import { emitSocketEvent, offSocketEvent, onSocketEvent } from '../../../config/webSocket';
import Checkbox from '../../../elements/checkBox/CheckBox';
import ChatInputSection from './ChatInputSection';
import TicketActions from './TicketActions';
import TicketHeader from './TicketHeader';
import usePermissionChecker from "../../../util/permissionChecker/PermissionChecker";
import Spinner from '../../../elements/customSpinner/Spinner';

export default function TicketDetails() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { ticketDetail } = location.state;
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(false);


    const [assignField, setAssignField] = useState({
        selectedRole: ticketDetail?.assignTo?.role?._id || null,
        selectedMember: ticketDetail?.assignTo?._id || null,
        isAssignedToMe: ticketDetail?.assignTo?.name === user?.admin_user?.name || null
    });

    const firstMessageDetails = {
        messageType: ticketDetail?.image ? 'image' : 'text',
        text: ticketDetail?.description,
        mediaUrl: ticketDetail?.image,
        createdAt: ticketDetail?.createdAt
    }
    const messagesEndRef = useRef(null);
    const [newMessage, setNewMessage] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showSelectedImage, setShowSelectedImage] = useState(false);
    const [imageFile, setImageFile] = useState();
    const [isAssignmentComplete, setIsAssignmentComplete] = useState(false);
    const [ticketMessages, setTicketMessages] = useState([]);

    const [markAsSolved, setMarkAsSolved] = useState(false);

    const checkPermission = usePermissionChecker();
    const isEditPermission = checkPermission('ticket', 'edit');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticketMessages]);

    useEffect(() => {
        const handleNewMessage = (message) => {
            setTicketMessages(prev => [...prev, message]);
            const body = {
                ticketId: ticketDetail?._id
            };
            emitSocketEvent('clear-unread-ticket-messages-count', body);
        };

        onSocketEvent('newTicketMessage', handleNewMessage);
        onSocketEvent("error", (error) => {
            dispatch(showErrorAlert(error?.message));
        });

        return () => {
            offSocketEvent('newTicketMessage', handleNewMessage);
            offSocketEvent('error', {});
        };
    }, []);

    useEffect(() => {
        const body = {
            ticketId: ticketDetail?._id
        };
        emitSocketEvent('clear-unread-ticket-messages-count', body);
    }, []);

    useEffect(() => {
        const fetchTicketMessages = async () => {
            try {
                setIsLoading(true);
                const response = await dispatch(ticketsMiddleware.GetTicketMessages(ticketDetail?._id));
                if (response.success) {
                    setTicketMessages(response?.messages);
                }
            } catch (err) {
                console.error('Error fetching messages:', err);
            } finally {
                setIsLoading(false);
            }
        };
        if (isAssignmentComplete && isEditPermission) fetchTicketMessages();
    }, [isAssignmentComplete]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage && !imageFile && !audioBlob) return;

        let body;
        if (imageFile) {
            const isImage = imageFile?.type?.includes('image');
            body = {
                "ticketId": ticketDetail?._id,
                "receiverId": ticketDetail?.user._id,
                "text": newMessage || '',
                "messageType": isImage ? 'image' : 'document',
                "file": imageFile,
                "fileName": imageFile.name,
                "mimeType": imageFile.type
            };
        } else if (audioBlob) {
            body = {
                "ticketId": ticketDetail?._id,
                "receiverId": ticketDetail?.user._id,
                "messageType": 'audio',
                "file": audioBlob,
                "fileName": audioBlob.name,
                "mimeType": audioBlob.type
            };
        } else {
            body = {
                "ticketId": ticketDetail?._id,
                "receiverId": ticketDetail?.user._id,
                "text": newMessage,
                "messageType": 'text',
                "file": null
            };
        }

        emitSocketEvent('sendTicketMessage', body);
        setNewMessage("");
        setImageFile(null);
        setAudioBlob(null);
    };

    const handleFileChange = (e) => {
        const file = Array.from(e.target.files);
        if (file.length > 0) {
            setImageFile(file[0]);
            setShowSelectedImage(true);
        }
    };

    const triggerFileInput = () => {
        document.getElementById("file-input").click();
    };

    const onEmojiClick = (event) => {
        setNewMessage((prev) => prev + event.emoji);
        setShowEmojiPicker(false);
    };


    const handleConfirmMarkAsSolved = async () => {
        if (markAsSolved === false) {
            return;
        }

        try {
            const payload = {
                "status": "solved"
            };
            const response = await dispatch(ticketsMiddleware.UpdateTicket(ticketDetail?._id, payload));
            if (response?.success) {
                navigate(-1);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleConfirmAssignment = async () => {
        if (assignField?.selectedMember === null) {
            dispatch(showErrorAlert("Select Member to assign"));
            return;
        }

        try {
            const payload = {
                "assignTo": assignField?.selectedMember,
                "status": "inprogress"
            };
            const response = await dispatch(ticketsMiddleware.UpdateTicket(ticketDetail?._id, payload));
            if (response?.success) {
                navigate(`/tickets?${searchParams.toString()}`);
            }
        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Ticket Details</h1>
                <CrossButton onClick={() => navigate(-1)} className="text-gray hover:text-gray-dark" />
            </div>

            <div className="flex flex-col flex-grow min-h-0 gap-4">
                {/* Scrollable content area */}
                <div className="flex-grow overflow-y-auto space-y-4">
                    <TicketExpandableInformation ticketDetail={ticketDetail} />

                    {(!isAssignmentComplete && isEditPermission) && (
                        <AssignTicket
                            assignField={assignField}
                            setAssignField={setAssignField}
                            user={user}
                            ticketDetail={ticketDetail}
                            setIsAssignmentComplete={setIsAssignmentComplete}
                        />
                    )}

                    {/* Messages Section */}
                    {isLoading ? <Spinner /> :
                        <div className="flex flex-col gap-2">
                            <OpponentMessage message={firstMessageDetails} />
                            {ticketMessages.map((message, index) => (
                                <div key={index}>
                                    {message.sender === ticketDetail?.user?._id ?
                                        <OpponentMessage message={message} />
                                        :
                                        <OwnMessage message={message} />
                                    }
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>}
                </div>

                {/* Sticky bottom section */}
                <div className="sticky bottom-0 bg-white pt-4 space-y-4">
                    {isAssignmentComplete && ticketDetail?.status !== 'solved' && !markAsSolved && assignField.isAssignedToMe && (
                        <ChatInputSection
                            isEditPermission={isEditPermission}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            handleSendMessage={handleSendMessage}
                            audioBlob={audioBlob}
                            setAudioBlob={setAudioBlob}
                            setShowEmojiPicker={setShowEmojiPicker}
                            handleFileChange={handleFileChange}
                            triggerFileInput={triggerFileInput}
                            showSelectedImage={showSelectedImage}
                            imageFile={imageFile}
                            setShowSelectedImage={setShowSelectedImage}
                            setImageFile={setImageFile}
                            showEmojiPicker={showEmojiPicker}
                            onEmojiClick={onEmojiClick}
                        />
                    )}

                    <TicketActions
                        isEditPermission={isEditPermission}
                        isAssignmentComplete={isAssignmentComplete}
                        isAssignedToMe={assignField.isAssignedToMe}
                        markAsSolved={markAsSolved}
                        onMarkAsSolvedChange={() => setMarkAsSolved(!markAsSolved)}
                        onConfirmMarkAsSolved={handleConfirmMarkAsSolved}
                        onDiscardMarkAsSolved={() => setMarkAsSolved(false)}
                        onDiscard={() => navigate(-1)}
                        onConfirmAssignment={handleConfirmAssignment}
                        status={ticketDetail?.status}
                    />
                </div>
            </div>
        </div>
    );
}