import { useState, useEffect } from "react";
const usePagination = (
  fetchData: <T>(params: any) => Promise<{ data: T[]; total: number }>
) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [data, setData] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchPageData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchData({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        filters,
      });

      setData(response.data || []); // Update with fetched data
      setTotalItems(response.total || 0); // Update total items
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, [currentPage, itemsPerPage, searchQuery, filters]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const applySearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to the first page
  };

  const applyFilters = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to the first page
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    applySearch,
    applyFilters,
    setItemsPerPage,
    itemsPerPage,
    totalItems,
    refetch: fetchPageData,
  };
};

export default usePagination;
