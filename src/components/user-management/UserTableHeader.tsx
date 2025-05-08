
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UserTableHeaderProps {
  onSortChange: (column: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const UserTableHeader = ({ onSortChange, sortBy, sortOrder }: UserTableHeaderProps) => {
  const getSortIndicator = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-8"></TableHead>
        <TableHead 
          className="cursor-pointer" 
          onClick={() => onSortChange('full_name')}
        >
          User {getSortIndicator('full_name')}
        </TableHead>
        <TableHead 
          className="cursor-pointer" 
          onClick={() => onSortChange('role')}
        >
          Role {getSortIndicator('role')}
        </TableHead>
        <TableHead 
          className="cursor-pointer"
        >
          Status
        </TableHead>
        <TableHead 
          className="cursor-pointer" 
          onClick={() => onSortChange('updated_at')}
        >
          Created {getSortIndicator('updated_at')}
        </TableHead>
        <TableHead 
          className="cursor-pointer" 
          onClick={() => onSortChange('last_sign_in_at')}
        >
          Last Login {getSortIndicator('last_sign_in_at')}
        </TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserTableHeader;
