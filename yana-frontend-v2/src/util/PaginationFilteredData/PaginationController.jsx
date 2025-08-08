import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const usePaginationController = (searchParamTabName, defaultItemsPerPage = 8) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get(searchParamTabName)) || 1;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage] = useState(defaultItemsPerPage);

  useEffect(() => {
    if (currentPage !== 1) {
      setSearchParams({ page: currentPage });
    } else {
      setSearchParams({});
    }
  }, [currentPage]);

  return {
    currentPage,
    setCurrentPage,
    itemsPerPage
  };
};