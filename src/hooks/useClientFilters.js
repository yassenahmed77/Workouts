import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
export function useClientFilters({ clients, defaultStatus = 'all', defaultSort = 'name', pageSize = 10 }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(defaultStatus);
    const [sortBy, setSortBy] = useState(defaultSort);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    // Debounce search query to keep UI responsive
    const debouncedSearch = useDebounce(searchQuery, 200);
    // Status counts for tabs
    const statusCounts = useMemo(() => {
        const counts = {
            all: 0,
            active: 0,
            needs_plan: 0,
            needs_diet: 0,
            needs_setup: 0,
            on_hold: 0
        };
        clients.forEach((c) => {
            counts.all++;
            if (c.status === 'active' && c.assignedPlanId && c.assignedDietPlanId)
                counts.active++;
            else if (!c.assignedPlanId)
                counts.needs_plan++;
            else if (!c.assignedDietPlanId)
                counts.needs_diet++;
            else if (c.status === 'pending')
                counts.needs_setup++;
            else if (c.status === 'on_hold' || c.status === 'inactive')
                counts.on_hold++;
            else
                counts.active++;
        });
        return counts;
    }, [clients]);
    // Filtered & Sorted Clients
    const filteredClients = useMemo(() => {
        let result = [...clients];
        // 1. Status Filter
        if (statusFilter !== 'all') {
            result = result.filter((c) => {
                if (statusFilter === 'active')
                    return c.status === 'active' && c.assignedPlanId && c.assignedDietPlanId;
                if (statusFilter === 'needs_plan')
                    return !c.assignedPlanId;
                if (statusFilter === 'needs_diet')
                    return !c.assignedDietPlanId;
                if (statusFilter === 'needs_setup')
                    return c.status === 'pending';
                if (statusFilter === 'on_hold')
                    return c.status === 'on_hold' || c.status === 'inactive';
                return true;
            });
        }
        // 2. Search Query
        if (debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase().trim();
            result = result.filter((c) => c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                (c.phone && c.phone.toLowerCase().includes(q)));
        }
        // 3. Sorting
        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            }
            else if (sortBy === 'weight') {
                comparison = (a.weightKg || 0) - (b.weightKg || 0);
            }
            else if (sortBy === 'adherence') {
                comparison = (a.nutritionAdherence || 0) - (b.nutritionAdherence || 0);
            }
            else if (sortBy === 'status') {
                comparison = a.status.localeCompare(b.status);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
        return result;
    }, [clients, statusFilter, debouncedSearch, sortBy, sortDirection]);
    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredClients.slice(start, start + pageSize);
    }, [filteredClients, currentPage, pageSize]);
    const handleStatusChange = (newStatus) => {
        setStatusFilter(newStatus);
        setCurrentPage(1);
    };
    const handleSearchChange = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };
    return {
        searchQuery,
        setSearchQuery: handleSearchChange,
        statusFilter,
        setStatusFilter: handleStatusChange,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
        currentPage,
        setCurrentPage,
        totalPages,
        statusCounts,
        filteredClients,
        paginatedClients,
        totalCount: clients.length,
        filteredCount: filteredClients.length
    };
}
