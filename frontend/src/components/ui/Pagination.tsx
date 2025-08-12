import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showPageNumbers?: number;
    className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    showPageNumbers = 5,
    className = "",
}) => {
    const getVisiblePages = () => {
        const delta = Math.floor(showPageNumbers / 2);
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, "...");
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push("...", totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    const visiblePages = getVisiblePages();

    return (
        <nav className={`flex items-center justify-center space-x-1 ${className}`}>
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center space-x-1">
                {visiblePages.map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`dots-${index}`}
                                className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </span>
                        );
                    }

                    const pageNumber = page as number;
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => onPageChange(pageNumber)}
                            className={`flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors duration-200 ${
                                isActive
                                    ? "text-white bg-blue-600 border border-blue-600 hover:bg-blue-700"
                                    : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </nav>
    );
};
