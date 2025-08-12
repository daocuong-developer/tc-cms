import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

interface FilterOption {
    value: string;
    label: string;
    count?: number;
    color?: string;
    icon?: string;
}

interface FilterDropdownProps {
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    searchable?: boolean;
    showCounts?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Chọn tùy chọn",
    className = "",
    searchable = false,
    showCounts = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const selectedOption = options.find((option) => option.value === value);

    const filteredOptions = searchable
        ? options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
        : options;

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm("");
        }
    };

    const handleOptionSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={handleToggle}
                className={`relative w-full bg-white border rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                    isOpen
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {selectedOption?.icon && <span className="text-base">{selectedOption.icon}</span>}
                        <span className={`block truncate ${selectedOption ? "text-gray-900" : "text-gray-500"}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        {selectedOption?.count !== undefined && showCounts && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {selectedOption.count}
                            </span>
                        )}
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ml-2 ${
                            isOpen ? "rotate-180 text-blue-500" : ""
                        }`}
                    />
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
                    {searchable && (
                        <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Tìm kiếm..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-64 overflow-y-auto">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">Không tìm thấy kết quả</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleOptionSelect(option.value)}
                                    className={`relative w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 group ${
                                        value === option.value ? "bg-blue-50 text-blue-700" : "text-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            {option.icon && (
                                                <span className="text-base flex-shrink-0">{option.icon}</span>
                                            )}
                                            <span className="block truncate font-medium">{option.label}</span>
                                            {option.count !== undefined && showCounts && (
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                                        value === option.value
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {option.count}
                                                </span>
                                            )}
                                        </div>
                                        {value === option.value && (
                                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                    {option.color && (
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                                            style={{ backgroundColor: option.color }}
                                        />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
