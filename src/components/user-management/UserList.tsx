
import React from "react";
import { User } from "@/types/user";
import { Loader2, User as UserIcon, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleNameForDisplay } from "@/types";

interface UserListProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  expandedUsers: Record<string, boolean>;
  toggleUserExpansion: (userId: string) => void;
}

const UserList = ({ 
  users, 
  loading, 
  onEdit, 
  onDelete,
  expandedUsers,
  toggleUserExpansion
}: UserListProps) => {
  if (loading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center py-10">
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  if (users.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={7} className="text-center py-6 text-gray-500">
            No users found
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {users.map(user => (
        <React.Fragment key={user.id}>
          <TableRow className={expandedUsers[user.id] ? "border-b-0" : ""}>
            <TableCell className="px-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => toggleUserExpansion(user.id)}
              >
                {expandedUsers[user.id] ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />}
              </Button>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 rounded-full p-2">
                  <UserIcon size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{user.full_name || 'No name'}</p>
                  <p className="text-sm text-gray-500">{user.Email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {getRoleNameForDisplay(user.role as any)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.active ? "success" : "destructive"} className="capitalize">
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
            </TableCell>
            <TableCell>
              {user.last_sign_in_at 
                ? new Date(user.last_sign_in_at).toLocaleDateString() 
                : 'Never'}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(user)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          {expandedUsers[user.id] && (
            <TableRow>
              <TableCell className="p-0"></TableCell>
              <TableCell colSpan={6} className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">User Details</h4>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-gray-500 text-sm">User ID:</dt>
                        <dd className="col-span-2 text-sm font-mono truncate">{user.id}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-gray-500 text-sm">Email:</dt>
                        <dd className="col-span-2 text-sm">{user.Email}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-gray-500 text-sm">Role:</dt>
                        <dd className="col-span-2 text-sm">{getRoleNameForDisplay(user.role as any)}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-gray-500 text-sm">Status:</dt>
                        <dd className="col-span-2 text-sm">{user.active ? 'Active' : 'Inactive'}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Activity</h4>
                    <dl className="space-y-2">
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-gray-500 text-sm">Created:</dt>
                        <dd className="col-span-2 text-sm">
                          {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <dt className="text-gray-500 text-sm">Last Login:</dt>
                        <dd className="col-span-2 text-sm">
                          {user.last_sign_in_at 
                            ? new Date(user.last_sign_in_at).toLocaleString() 
                            : 'Never'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      ))}
    </TableBody>
  );
};

export default UserList;
