const statusStyles = {
    Active: 'bg-green-100 text-green-dark border-green-dark',
    Inactive: 'bg-red-light text-red-dark border-red-dark',
    Inprogress: 'bg-red-light text-red-dark border-red-dark',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-700',
    Unassigned: 'bg-yellow-100 text-yellow-700 border-yellow-700',
    Approved: 'bg-blue-100 text-blue-700 border-blue-700',
    Completed: 'bg-blue-100 text-blue-700 border-blue-700',
    Canceled: 'bg-red-light text-red-dark border-red-dark',
    Default: 'bg-gray-100 text-gray-dark border-gray-dark',

    in_process:'bg-yellow-100 text-yellow-700 border-yellow-700',
    denied:'bg-red-light text-red-dark border-red-dark',
    paid:'bg-blue-100 text-blue-700 border-blue-700',
    partially_paid:'bg-blue-100 text-blue-400 border-blue-700',
    billed:'bg-green-100 text-green-dark border-green-dark',

    Open: "bg-green-100 text-green-dark border-green-dark",
    Solved: "bg-blue-100 text-blue-700 border-blue-700",
};

export default statusStyles;
