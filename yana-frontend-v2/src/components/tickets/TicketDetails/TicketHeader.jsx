import CrossButton from "../../../elements/crossButton/CrossButton";

export default function TicketHeader({ onClose }) {

    return (
        <div className='flex justify-between items-center'>
            <h1 className="text-xl font-bold">Ticket Management</h1>
            <CrossButton onClick={onClose} className="text-gray hover:text-gray-dark" />
        </div>
    );

}