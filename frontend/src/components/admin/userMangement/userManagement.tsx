

// import React, { useState, useEffect } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '../../../components/ui/table';
// import { Badge } from '../../../components/ui/badge';
// import { Button } from '../../../components/ui/button';
// import { Input } from '../../../components/ui/input';
// import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
// import { Search, Lock, Unlock } from 'lucide-react';
// import { userManageService } from '../../../services/admin/userManageService';
// import { IUser } from '../../../types/auth/auth.types';

// // Status badge styles
// const statusStyles = {
//   active: 'bg-green-100 text-green-800',
//   blocked: 'bg-red-100 text-red-800',
// };

// export default function AdminUserManagement() {
//   const [users, setUsers] = useState<IUser[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');

//   // Fetch users from backend
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const fetchedUsers: any[] = await userManageService.getUsers();
//         // Map _id to id and set default isActive
//         const validatedUsers = fetchedUsers.map((user) => ({
//           ...user,
//           id: user._id, // Map _id to id
//           isActive: user.isActive ?? true, // Default to active if undefined
//         }));
//         setUsers(validatedUsers);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//       }
//     };
//     fetchUsers();
//   }, []);

//   // Filter users based on search term
//   const filteredUsers = users.filter(
//     (user) =>
//       (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (user.profession || '').toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Handle block user action
//   const handleBlockUser = async (userId: string) => {
//     try {
//       await userManageService.blockUser(userId);
//       setUsers(
//         users.map((user) =>
//           user.id === userId ? { ...user, isActive: false } : user
//         )
//       );
//     } catch (error) {
//       console.error('Error blocking user:', error);
//     }
//   };

//   // Handle unblock user action
//   const handleUnblockUser = async (userId: string) => {
//     try {
//       await userManageService.unblockUser(userId);
//       setUsers(
//         users.map((user) =>
//           user.id === userId ? { ...user, isActive: true } : user
//         )
//       );
//     } catch (error) {
//       console.error('Error unblocking user:', error);
//     }
//   };

//   return (
//     <div className="w-full px-4 py-8 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">User Management</h1>
//       </div>

//       <div className="flex items-center space-x-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
//           <Input
//             placeholder="Search users..."
//             className="pl-8"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>

//       <div className="rounded-md border">
//         <Table>
//           <TableCaption>
//             {filteredUsers.length > 0
//               ? 'A list of all users in the system.'
//               : 'No users found matching your search.'}
//           </TableCaption>
//           <TableHeader>
//             <TableRow>
//               <TableHead className="w-12">Image</TableHead>
//               <TableHead>Name</TableHead>
//               <TableHead>Email</TableHead>
//               <TableHead>Premium</TableHead>
//               <TableHead>Status</TableHead>
//               <TableHead>Role</TableHead>
//               <TableHead>Profession</TableHead>
//               <TableHead>Created At</TableHead>
//               <TableHead className="text-right">Actions</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {filteredUsers.map((user) => (
//               <TableRow key={user.id || user.email}>
//                 <TableCell>
//                   <Avatar className="h-8 w-8">
//                     <AvatarImage src={user.profileImage} alt={user.name || 'User'} />
//                     <AvatarFallback>
//                       {(user.name || user.email?.substring(0, 2) || 'U').substring(0, 2).toUpperCase()}
//                     </AvatarFallback>
//                   </Avatar>
//                 </TableCell>
//                 <TableCell className="font-medium">{user.name || '-'}</TableCell>
//                 <TableCell>{user.email || '-'}</TableCell>
//                 <TableCell>
//                   <Badge variant={user.isPremium ? 'default' : 'outline'}>
//                     {user.isPremium ? 'Premium' : 'Free'}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>
//                   <Badge className={statusStyles[user.isActive ? 'active' : 'blocked']}>
//                     {user.isActive ? 'Active' : 'Blocked'}
//                   </Badge>
//                 </TableCell>
//                 <TableCell>{user.role || '-'}</TableCell>
//                 <TableCell>{user.profession || '-'}</TableCell>
//                 <TableCell>
//                   {user.createdAt
//                     ? new Date(user.createdAt).toLocaleDateString()
//                     : '-'}
//                 </TableCell>
//                 <TableCell className="text-right">
//                   {user.isActive ? (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="text-red-600 border-red-200 hover:bg-red-50"
//                       onClick={() => user.id && handleBlockUser(user.id)}
//                       disabled={!user.id}
//                     >
//                       <Lock className="h-4 w-4 mr-1" />
//                       Block
//                     </Button>
//                   ) : (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="text-green-600 border-green-200 hover:bg-green-50"
//                       onClick={() => user.id && handleUnblockUser(user.id)}
//                       disabled={!user.id}
//                     >
//                       <Unlock className="h-4 w-4 mr-1" />
//                       Unblock
//                     </Button>
//                   )}
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </div>
//   );
// }







import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Search, Lock, Unlock } from 'lucide-react';
import { userManageService } from '../../../services/admin/userManageService';
import { IUser } from '../../../types/auth/auth.types';

// Status badge styles
const statusStyles = {
  active: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800',
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirm, setShowConfirm] = useState<{
    action: 'block' | 'unblock' | null;
    userId: string;
  } | null>(null);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers: any[] = await userManageService.getUsers();
        // Map _id to id and set default isActive
        const validatedUsers = fetchedUsers.map((user) => ({
          ...user,
          id: user._id, // Map _id to id
          isActive: user.isActive ?? true, // Default to active if undefined
        }));
        setUsers(validatedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profession || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle block user action
  const handleBlockUser = async (userId: string) => {
    try {
      await userManageService.blockUser(userId);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isActive: false } : user
        )
      );
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  // Handle unblock user action
  const handleUnblockUser = async (userId: string) => {
    try {
      await userManageService.unblockUser(userId);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isActive: true } : user
        )
      );
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  // Handle confirmation
  const handleConfirmAction = () => {
    if (showConfirm) {
      if (showConfirm.action === 'block') {
        handleBlockUser(showConfirm.userId);
      } else if (showConfirm.action === 'unblock') {
        handleUnblockUser(showConfirm.userId);
      }
      setShowConfirm(null);
    }
  };

  // Handle cancel confirmation
  const handleCancelAction = () => {
    setShowConfirm(null);
  };

  return (
    <div className="w-full px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {filteredUsers.length > 0
              ? 'A list of all users in the system.'
              : 'No users found matching your search.'}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Profession</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id || user.email}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage} alt={user.name || 'User'} />
                    <AvatarFallback>
                      {(user.name || user.email?.substring(0, 2) || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{user.name || '-'}</TableCell>
                <TableCell>{user.email || '-'}</TableCell>
                <TableCell>
                  <Badge variant={user.isPremium ? 'default' : 'outline'}>
                    {user.isPremium ? 'Premium' : 'Free'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusStyles[user.isActive ? 'active' : 'blocked']}>
                    {user.isActive ? 'Active' : 'Blocked'}
                  </Badge>
                </TableCell>
                <TableCell>{user.role || '-'}</TableCell>
                <TableCell>{user.profession || '-'}</TableCell>
                <TableCell>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {user.isActive ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => user.id && setShowConfirm({ action: 'block', userId: user.id })}
                      disabled={!user.id}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Block
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => user.id && setShowConfirm({ action: 'unblock', userId: user.id })}
                      disabled={!user.id}
                    >
                      <Unlock className="h-4 w-4 mr-1" />
                      Unblock
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showConfirm && (
        <Dialog open={!!showConfirm} onOpenChange={() => setShowConfirm(null)}>
          <DialogContent className="sm:max-w-[425px] p-6 bg-white rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Confirm {showConfirm.action === 'block' ? 'Block' : 'Unblock'} User
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to {showConfirm.action === 'block' ? 'block' : 'unblock'} this user?
                This action will update the user status to{' '}
                {showConfirm.action === 'block' ? '"Blocked"' : '"Active"'}.
              </p>
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancelAction}
                className="text-gray-600 border-gray-300 hover:bg-gray-50 text-sm py-2 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={
                  showConfirm.action === 'block'
                    ? 'bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-4'
                    : 'bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-4'
                }
              >
                {showConfirm.action === 'block' ? 'Block' : 'Unblock'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
