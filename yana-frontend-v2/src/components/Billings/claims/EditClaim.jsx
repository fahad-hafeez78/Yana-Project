import { useEffect, useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ordersMiddleware from "../../../redux/middleware/ordersMiddleware";
import moment from "moment";
import billingMiddleware from "../../../redux/middleware/billingMiddleware";
import Spinner from "../../../elements/customSpinner/Spinner";
import ClaimFormFields from "./ClaimFormFields";

export default function EditClaim() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoading, setisLoading] = useState(false);

    const location = useLocation();
    const { claimDetails, isEditable, isStatusEditable } = location?.state;

    const [latestOrders, setLatestOrders] = useState([]);

    const [formData, setFormData] = useState({
        customer: claimDetails?.customer?._id || "",
        order: claimDetails?.order?._id || "",
        dob: claimDetails?.customer?.dob || "",
        created_date: claimDetails?.created_date || "",
        claim_num: claimDetails?.claim_num || "",
        memberId: claimDetails?.customer?.memberId || "",
        from_dos: claimDetails?.from_dos || "",
        to_dos: claimDetails?.to_dos || "",
        facility: claimDetails?.facility || "",
        status: claimDetails?.status || "",
        insurance: claimDetails?.insurance || "",
        cpt: claimDetails?.cpt || "",
        unit_price: claimDetails?.unit_price || "",
        units: claimDetails?.units || "",
        days: claimDetails?.days || "",
        billed_amount: claimDetails?.billed_amount || "",
        allowed_amount: claimDetails?.allowed_amount || "",
        paid_amount: claimDetails?.paid_amount || "",
        payment_date: claimDetails?.payment_date || "",
        check: claimDetails?.check || "",
        comment: claimDetails?.comment || ""
    });

    useEffect(() => {
        const latestOrderByParticipantId = async () => {
            try {
                const response = await dispatch(ordersMiddleware.GetOrdersByParticipantId(claimDetails?.customer?._id));
                const options = response?.orders?.map(order => ({
                    value: order._id,
                    label: moment(order.createdAt).format("MM-DD-YYYY"),
                    status: order?.status
                }));
                setLatestOrders([{ value: "", label: "Select", status: "Not selected" }, ...options]);

            } catch (error) {
                console.error("Error fetching customers:", error);
            }
            finally {
            }
        };

        latestOrderByParticipantId();

    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = (e) => {
        e.preventDefault();
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setisLoading(true);

            delete formData.dob;
            delete formData.memberId;

            const response = await dispatch(billingMiddleware.UpdateClaim(claimDetails?._id, formData));
            if (response?.success) {
                navigate(-1);
            }
        } catch (error) {

        } finally {
        }
    };

    if (isLoading) {
        return <div className="bg-white p-5 rounded-2xl h-full"><Spinner /></div>
    }

    return (
        <div className="bg-white p-5 rounded-2xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-[#959595] font-bold text-2xl">Claim Details</h1>
                <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
            </div>

            <ClaimFormFields
                formData={formData}
                selectedCustomer={claimDetails?.customer?.name || null}
                setFormData={setFormData}
                isEditable={isEditable}
                isStatusEditable={isStatusEditable}
                handleInputChange={handleInputChange}
                latestOrders={latestOrders}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
            />
        </div>
    )
}