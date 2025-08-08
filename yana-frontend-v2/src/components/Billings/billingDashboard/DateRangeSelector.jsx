const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

export default function DateRangeSelector ({
  timeRange,
  selectedMonth,
  selectedYear,
  showMonthDropdown,
  showYearDropdown,
//   months,
  years,
  requireYearSelection,
  onMonthClick,
  onYearClick,
  onMonthSelect,
  onYearSelect
}) {
  return (
    <div className="flex gap-2 relative">
      {/* Monthly Button with Dropdown */}
      <div className="relative">
        <button
          onClick={onMonthClick}
          className={`px-3 py-1 rounded-md text-sm border-2 ${
            timeRange === 'month' 
              ? 'bg-blue-500 border-blue-700 text-white' 
              : 'border-gray-light'
          }`}
        >
          {selectedMonth}
        </button>
        {showMonthDropdown && (
          <div className="absolute z-[9999] max-h-[200px] overflow-y-auto mt-1 right-0 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
            {months.map((month, index) => (
              <button
                key={index}
                onClick={() => onMonthSelect(month)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  month === selectedMonth 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-dark hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Yearly Button with Dropdown */}
      <div className="relative">
        <button
          onClick={onYearClick}
          className={`px-3 py-1 rounded-md text-sm border-2 ${
            timeRange === 'year' 
              ? 'bg-blue-500 border-blue-700 text-white' 
              : requireYearSelection
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'border-gray-light'
          }`}
        >
          {selectedYear}
        </button>
        {showYearDropdown && (
          <div className="absolute z-[9999] max-h-[200px] overflow-y-auto mt-1 right-0 w-32 bg-white border border-gray-200 rounded-md shadow-lg">
            {years.map((year, index) => (
              <button
                key={index}
                onClick={() => onYearSelect(year)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  year === selectedYear 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-dark hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
