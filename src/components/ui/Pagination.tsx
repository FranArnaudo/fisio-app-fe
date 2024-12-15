import React from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import Button from "./Button";
import Select from "./Select";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
};

const itemsPerPageOptions = [
  { value: 5, text: "5", id: "5" },
  { value: 10, text: "10", id: "10" },
  { value: 15, text: "15", id: "15" },
  { value: 20, text: "20", id: "20" },
];
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}) => {
  if (totalPages <= 0) return null;

  const buildPages = () => {
    const pages: (number | string)[] = [];
    const addPage = (page: number | string) => pages.push(page);

    const prevPage = currentPage - 1;
    const nextPage = currentPage + 1;

    // Left ellipses
    if (prevPage > 2) {
      addPage("...");
    } else if (prevPage === 2) {
      addPage(1);
    }

    if (prevPage > 1) addPage(prevPage);
    addPage(currentPage);
    if (nextPage < totalPages) addPage(nextPage);

    // Right ellipses
    if (nextPage < totalPages - 1) {
      addPage("...");
    } else if (nextPage === totalPages - 1) {
      addPage(totalPages);
    }

    return pages;
  };

  const pages = buildPages();

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="w-full flex items-center justify-between mt-4">
      {/* Items per page selector on the left */}
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>Items por página:</span>
        <Select
          value={
            itemsPerPageOptions.find(
              (option) => option.value === itemsPerPage
            ) ?? itemsPerPageOptions[1]
          }
          onChange={(option) => onItemsPerPageChange(Number(option.value))}
          options={itemsPerPageOptions}
        />
      </div>

      {/* Pagination controls on the right */}
      <div className="flex items-center space-x-2">
        <Button
          iconStart={<BsChevronLeft />}
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
        />

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={index} className="text-gray-500 px-2">
              ...
            </span>
          ) : (
            <button
              key={page as number}
              onClick={() => goToPage(page as number)}
              className={`
                inline-flex items-center justify-center
                rounded-md border border-gray-300
                px-3 py-1
                text-sm
                ${
                  page === currentPage
                    ? "bg-primary text-white border-transparent"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }
                transition-colors
              `}
            >
              {page}
            </button>
          )
        )}

        <Button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          iconStart={<BsChevronRight />}
          variant="secondary"
        />
      </div>
    </div>
  );
};

export default Pagination;
