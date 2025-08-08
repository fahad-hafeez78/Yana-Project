import { useState } from "react";
import moment from "moment";
import { ExpandableIcon } from '../../../assets/customIcons/sidebarIcons/SidebarIcons';
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";

export default function TicketExpandableInformation({ ticketDetail }) {

    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    const details = [
        { label: "Ticket Id", value: ticketDetail?.ticket_id },
        { label: "Participant Name", value: ticketDetail?.user?.name },
        { label: "Participant Id", value: ticketDetail?.user?.customer_id },
        { label: "Category", value: ticketDetail?.category },
        { label: "Status", value: capitalizeFirstLetter(ticketDetail?.status) },
        { label: "Assigned To", value: ticketDetail?.assignTo?.name || 'Pending' },
        // { label: "Created Date", value: moment(ticketDetail?.createdAt).format("MM-DD-YY") },
    ]

    return (
        <div className="border border-gray-200 rounded-lg ">
            <h2>
                <button
                    type="button"
                    className={`flex items-center justify-between w-full p-2 font-medium text-left text-gray hover:bg-gray-100 transition-colors ${isOpen ? 'border-b border-gray-200' : ''}`}
                    onClick={toggleAccordion}
                    aria-expanded={isOpen}
                >
                    <span>Ticket Information</span>
                    <ExpandableIcon isExpanded={isOpen} />
                </button>
            </h2>

            <div className={`p-5 border-gray-200 ${isOpen ? 'block' : 'hidden'}`} aria-hidden={!isOpen}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {details.map((detail, index) => (
                        <div className='flex flex-col' key={index}>
                            <span className="text-sm text-gray">{detail.label}</span>
                            <span className="font-medium">{detail?.value}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}