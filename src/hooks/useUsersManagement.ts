
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types/user";
import { toast } from "@/components/ui/sonner";

interface UseUsersManagementProps {
  filterRole: UserRole | null;
  filterInactive?: boolean;
}

export const useUsersManagement = ({ filterRole, filterInactive = false }: UseUsersManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<string>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log(`Fetching users with filters: role=${filterRole}, inactive=${filterInactive}`);
      
      // Calculate pagination parameters
      const from = (currentPage - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      
      // Build query based on filters
      let query = supabase.from('profiles').select('*', { count: 'exact' });
      
      // Apply role filter if specified
      if (filterRole) {
        console.log(`Filtering by role: ${filterRole}`);
        query = query.eq('role', filterRole);
      }
      
      // Apply active status filter if specified
      if (filterInactive !== undefined) {
        const activeStatus = !filterInactive;
        console.log(`Filtering by active status: ${activeStatus}`);
        query = query.eq('active', activeStatus);
      }
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      query = query.range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      console.log(`Retrieved ${data?.length || 0} users from database`);
      console.log(`Total count: ${count}`);
      
      if (count !== null) {
        setTotalPages(Math.max(1, Math.ceil(count / usersPerPage)));
      }
      
      if (data) {
        setUsers(data as User[]);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      toast.error(`Error fetching users: ${error.message}`);
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterInactive, currentPage, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSortChange = (column: string) => {
    if (sortBy !== column) {
      // If clicking a new column, set it as sort column with ascending order
      setSortBy(column);
      setSortOrder('asc');
    } else {
      // If clicking the same column, toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    }
  };

  return {
    users,
    loading,
    currentPage,
    totalPages,
    sortBy,
    sortOrder,
    fetchUsers,
    handlePageChange,
    handleSortChange,
  };
};

export default useUsersManagement;
