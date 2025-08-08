import React, { useState, useEffect } from "react";
import search from "../../assets/customIcons/generalIcons/search.svg";

function SearchBar({ Data, setData, className, searchBarOptions, onSearchChange }) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    handleFilter();
  }, [searchQuery, Data]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleFilter = () => {
    if (!Data || Data.length === 0 || !searchQuery) {
      setData(Data || []);
      return;
    }

    const query = searchQuery.toLowerCase();

    const filteredData = Data.filter(item => {

      return searchBarOptions.some(option => {
        try {
          const value = option.key.includes('.')
            ? option.key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, item)
            : item[option.key];

          return value?.toString().toLowerCase().includes(query);
        } catch (e) {
          return false;
        }
      });
    });

    setData(filteredData);
  };

  return (
    <div className="relative flex items-center">
      <input
        type="search"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleInputChange}
        className={`h-8 w-full bg-gray-100 border border-gray-200 rounded-md px-2 pl-8 outline-none ${className}`}
      />
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
        <img src={search} alt="search" width={16} height={16} />
      </div>
    </div>
  );
}

export default SearchBar;