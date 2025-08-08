import { useEffect, useState } from "react";
import Table from "../../elements/table/Table";
import { useDispatch } from "react-redux";
import trashItemsMiddleware from "../../redux/middleware/trashItemsMiddleware";
import TrashActionModal from "../../components/trash/TrashActionModal";

const tabs = [
    { value: 'orders', label: 'Orders', activeClass: 'text-green' },
    { value: 'vendors', label: 'Vendors', activeClass: 'text-red ' },
];



export default function Trash() {

    const dispatch = useDispatch();
    const [tabCurrentStatus, setTabCurrentStatus] = useState("orders");
    const [isLoading, setIsLoading] = useState(false);

    const [deletedItems, setDeletedItems] = useState([]);
    const [filteredDeletedItems, setFilteredDeletedItems] = useState([]);

    const [isTrashActionModalOpen, setIsTrashActionModalOpen] = useState(false);

    const [deleteItemAction, setDeleteItemAction] = useState({
        data: [],
        actionType: "",
        actionPage: ""
    });
    const orderColumns = [
        { key: 'order_id', header: 'Order Id' },
        { key: 'customer.name', header: 'Participant Name' },
        { key: 'phone', header: 'Phone' },
        { key: 'vendor.name', header: 'Vendor' },
        {
            key: 'Actions', header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-2 py-1">
                    <button
                        onClick={() => { setDeleteItemAction({ data: row, actionType: "restore", actionPage: "order" }), setIsTrashActionModalOpen(true) }}
                        className="p-1 rounded font-xs text-white bg-green hover:bg-green-dark">
                        Restore
                    </button>
                    <button
                        onClick={() => { setDeleteItemAction({ data: row, actionType: "delete", actionPage: "order" }), setIsTrashActionModalOpen(true) }}
                        className="p-1 rounded font-xs text-white bg-red hover:bg-red-dark">
                        Delete
                    </button>
                </div>
            )
        },
    ];
    const vendorColumns = [
        { key: 'vendor_id', header: 'Vendor Id' },
        { key: 'name', header: 'Name' },
        { key: 'phone', header: 'Phone' },
        { key: 'unified_user.email', header: 'Email' },
        {
            key: 'Actions', header: 'Actions',
            accessor: (row) => (
                <div className="flex gap-2 py-1">
                    <button
                        onClick={() => { setDeleteItemAction({ data: row, actionType: "restore", actionPage: "vendor" }), setIsTrashActionModalOpen(true) }}
                        className="p-1 rounded font-xs text-white bg-green hover:bg-green-dark">
                        Restore
                    </button>
                    <button
                        onClick={() => { setDeleteItemAction({ data: row, actionType: "delete", actionPage: "vendor" }), setIsTrashActionModalOpen(true) }}
                        className="p-1 rounded font-xs text-white bg-red hover:bg-red-dark">
                        Delete
                    </button>
                </div>
            )
        },
    ];


    const itemsPerPage = 100;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredDeletedItems?.length / itemsPerPage);
    const displayItems = filteredDeletedItems?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    useEffect(() => {
        if (tabCurrentStatus === 'orders') fetchDeletedOrders();
        else fetchDeletedVendors();

    }, [tabCurrentStatus]);

    const fetchDeletedVendors = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(trashItemsMiddleware.GetTrashedVendors());
            console.log("reponse", response)
            setDeletedItems(response?.vendors)
        } catch (error) {

        }
        finally {
            setIsLoading(false);
        }
    }
    const fetchDeletedOrders = async () => {
        setIsLoading(true);
        try {
            const response = await dispatch(trashItemsMiddleware.GetTrashedOrders());
            console.log("reponse orders", response)
            setDeletedItems(response?.orders)
        } catch (error) {

        }
        finally {
            setIsLoading(false);
        }
    }

    const handleDeleteConfirm = async (e) => {
        e.preventDefault();
        if (deleteItemAction.actionType === 'restore') {
            if (deleteItemAction.actionPage === 'order') {
                handleRestoreOrder()
            }
            else
                handleRestoreVendor()
        }
        else if (deleteItemAction.actionType === 'delete') {
            if (deleteItemAction.actionPage === 'order') {
                handleDeleteOrder()
            }
            else
                handleDeleteVendor()
        }
    };

    const handleRestoreOrder = async () => {
        try {
            const response = await dispatch(trashItemsMiddleware.RestoreOrder(deleteItemAction?.data?._id));
        } catch (error) {

        }
        finally{
            setDeleteItemAction({data:[], actionPage:"", actionType:""})
            setIsTrashActionModalOpen(false);
            fetchDeletedOrders();
        }
    };

    const handleRestoreVendor = async () => {
        try {
            const response = await dispatch(trashItemsMiddleware.RestoreVendor(deleteItemAction?.data?.unified_user?._id));
        } catch (error) {

        }
        finally{
            setDeleteItemAction({data:[], actionPage:"", actionType:""})
            setIsTrashActionModalOpen(false)
            fetchDeletedVendors();
        }
    };

    const handleDeleteOrder = async () => {
        try {
            const response = await dispatch(trashItemsMiddleware.DeleteOrder(deleteItemAction?.data?._id));
        } catch (error) {

        }
        finally{
            setDeleteItemAction({data:[], actionPage:"", actionType:""})
            setIsTrashActionModalOpen(false)
            fetchDeletedOrders();
        }
    };

    const handleDeleteVendor = async () => {
        try {
            const response = await dispatch(trashItemsMiddleware.DeleteVendor(deleteItemAction?.data?.unified_user?._id));
        } catch (error) {

        }
        finally{
            setDeleteItemAction({data:[], actionPage:"", actionType:""})
            setIsTrashActionModalOpen(false)
            fetchDeletedVendors();
        }
    };


    const handleDeleteCancel = () => {
        setIsTrashActionModalOpen(false);
    };

    return (
        <>
            <Table
                tableTitle="Deleted Items"

                tabs={tabs}
                filterStatus={tabCurrentStatus}
                setFilterStatus={setTabCurrentStatus}

                columns={tabCurrentStatus === 'orders' ? orderColumns : vendorColumns}
                rows={displayItems}

                searchBarData={deletedItems}
                searchBarSetData={setFilteredDeletedItems}
                searchBarclassName="h-8 bg-gray-100 border border-gray-100 rounded-md px-2"

                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredDeletedItems?.length}

                // tableHeight="h-[calc(100vh-270px)]"
                isLoading={isLoading}
            />
            {isTrashActionModalOpen && (
                <TrashActionModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    deleteItemAction={deleteItemAction}
                />
            )}
        </>
    )
}