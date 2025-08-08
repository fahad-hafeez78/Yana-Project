import ButtonWithIcon from "../../../elements/buttonWithIcon/ButtonWithIcon";
import Checkbox from "../../../elements/checkBox/CheckBox";

export default function TicketActions({
    isAssignmentComplete,
    markAsSolved,
    onMarkAsSolvedChange,
    onConfirmMarkAsSolved,
    onDiscardMarkAsSolved,
    onDiscard,
    onConfirmAssignment,
    status,
    isAssignedToMe,
    isEditPermission
}) {
    if (status === 'solved') {
        return (
            <div className="flex space-x-4 justify-center">
                <ButtonWithIcon
                    type="button"
                    text="Close"
                    variant="discard"
                    onClick={onDiscard}
                />
            </div>
        );
    }

    if (!isAssignmentComplete) {
        return (
            <div className="flex space-x-4 justify-center">
                <ButtonWithIcon
                    type="button"
                    text="Discard"
                    variant="discard"
                    onClick={onDiscard}
                />
                {isEditPermission && <ButtonWithIcon
                    type="button"
                    text="Confirm"
                    variant="confirm"
                    onClick={onConfirmAssignment}
                />}
            </div>
        );
    }

    return (
        <>
            {isEditPermission && isAssignedToMe ? <div className='flex w-full justify-start'>
                <Checkbox
                    label="Mark as solved"
                    checked={markAsSolved}
                    onChange={onMarkAsSolvedChange}
                />
            </div> :
                <div className="flex space-x-4 justify-center">
                    <ButtonWithIcon
                        type="button"
                        text="Discard"
                        onClick={onDiscard}
                        variant="discard"
                    />
                </div>}

            {markAsSolved && (
                <div className="flex space-x-4 justify-center">
                    <ButtonWithIcon
                        type="button"
                        text="Discard"
                        onClick={onDiscardMarkAsSolved}
                        variant="discard"
                    />
                    <ButtonWithIcon
                        type="button"
                        text="Confirm"
                        onClick={onConfirmMarkAsSolved}
                        variant="confirm"
                    />
                </div>
            )}
        </>
    );
};