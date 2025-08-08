import Table from "../../../elements/table/Table";
import moment from "moment";
import capitalizeFirstLetter from "../../../util/capitalizeFirstLetter/CapitalizeFirstLetter";
import statusStyles from "../../../util/statusStyles/StatusStyles";

const columns = [
    { key: 'claim_num', header: 'Claim No' },
    { key: 'customer.name', header: 'Name' },
    {
        key: 'created_date',
        header: 'Created Date',
        accessor: (row) => (
            moment.utc(row?.created_date).format("MM-DD-YYYY")
        )
    },
    { key: 'customer.memberId', header: 'Member Id' },
    { key: 'order.order_id', header: 'Order Id' },
    { key: 'facility', header: 'Facility' },
    {
        key: 'status',
        header: 'Status',
        accessor: (row) => (
            <div className="py-2 flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm border min-w-[100px] text-center ${statusStyles[row?.status] || statusStyles.default}`}>
                    {capitalizeFirstLetter(row?.status)}
                </span>
            </div>
        )
    }
];

export default function ClaimsTable({ claims }) {
    return (
        <Table
            tableTitle="Claims"
            columns={columns}
            rows={claims}
        />
    );
};
