import { useEffect, useState } from "react";
import CrossButton from "../../../elements/crossButton/CrossButton";
import { useNavigate } from "react-router-dom";
import customersMiddleware from "../../../redux/middleware/customersMiddleware";
import { useDispatch } from "react-redux";
import ordersMiddleware from "../../../redux/middleware/ordersMiddleware";
import moment from "moment";
import billingMiddleware from "../../../redux/middleware/billingMiddleware";
import Spinner from "../../../elements/customSpinner/Spinner";
import ClaimFormFields from "./ClaimFormFields";

export default function AddClaim() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setisLoading] = useState(true);

    const [allCustomers, setAllCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [latestOrders, setLatestOrders] = useState([]);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [formData, setFormData] = useState({
        customer: "",
        order: "",
        dob: "",
        created_date: "",
        claim_num: "",
        memberId: "",
        from_dos: "",
        to_dos: "",
        facility: "",
        insurance: "",
        status: "",
        cpt: "",
        unit_price: "",
        units: "",
        days: "",
        billed_amount: "",
        allowed_amount: "",
        paid_amount: "",
        payment_date: "",
        check: "",
        comment: ""
    });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await dispatch(customersMiddleware.GetAllCustomers("all"));
                setAllCustomers(response?.customers);
            } catch (error) {
                console.error("Error fetching customers:", error);
            }
            finally {
                setisLoading(false);
            }
        };
        fetchCustomers()
    }, []);

    const latestOrderByParticipantId = async (customer) => {
        try {
            console.log("customer", customer)
            setFilteredCustomers([]);
            setSelectedCustomer(customer?.name);
            setFormData(prev => ({
                ...prev,
                customer: customer?._id,
                dob: customer?.dob,
                memberId: customer?.memberId,
            }));
            const response = await dispatch(ordersMiddleware.GetOrdersByParticipantId(customer?._id));
            const options = response?.orders?.map(order => ({
                value: order._id,
                label: moment(order.createdAt).format("MM-DD-YYYY"),
                status: order?.status
            }));
            setLatestOrders([{ value: "", label: "Select", status: "Not Selected" }, ...options]);

        } catch (error) {
            console.error("Error fetching customers:", error);
        }
        finally {
        }
    };



    const handleParticipantChange = (e) => {
        const { value } = e.target;
        const checkParticipant = value.trim() ? allCustomers.filter(customer => customer.name.toLowerCase().includes(value.toLowerCase())) : [];
        setFilteredCustomers(checkParticipant);
        setSelectedCustomer(value);
    };

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

            const response = await dispatch(billingMiddleware.CreateNewClaim(formData));
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
                <h1 className="text-[#959595] font-bold text-2xl">Add Claim</h1>
                <CrossButton onClick={handleCancel} className="text-gray hover:text-gray-dark" />
            </div>
            <ClaimFormFields
                formData={formData}
                selectedCustomer={selectedCustomer}
                filteredCustomers={filteredCustomers}
                setFormData={setFormData}
                handleInputChange={handleInputChange}
                latestOrderByParticipantId={latestOrderByParticipantId}
                handleParticipantChange={handleParticipantChange}
                latestOrders={latestOrders}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
            />
        </div>
    )
}