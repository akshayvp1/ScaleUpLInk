// import React, { useState } from 'react';
// import { X } from 'lucide-react';
// import { IUser } from '../../types/auth/auth.types';
// import UserProfileModal from './UserProfileModal';

// interface UserListModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   users: IUser[];
//   isLoading: boolean;
// }

// const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users, isLoading }) => {
//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

//   const handleUserClick = (userId: string) => {
//     if (!userId) {
//       console.warn('Invalid userId clicked:', userId);
//       return;
//     }
//     setSelectedUserId(userId);
//   };

//   return (
//     <>
//       <div
//         className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
//           isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//         role="dialog"
//         aria-labelledby="user-list-modal-title"
//         aria-modal="true"
//       >
//         <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//         <div className="relative w-full max-w-md bg-background rounded-xl shadow-xl p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
//             aria-label="Close modal"
//           >
//             <X className="w-6 h-6" />
//           </button>
//           <h3 id="user-list-modal-title" className="text-xl font-semibold text-foreground mb-6">
//             {title}
//           </h3>
//           {isLoading ? (
//             <div className="text-center py-4">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
//               <p className="text-muted-foreground mt-2">Loading {title.toLowerCase()}...</p>
//             </div>
//           ) : users.length === 0 ? (
//             <p className="text-muted-foreground text-center">No {title.toLowerCase()} yet.</p>
//           ) : (
//             <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//               {users.map((user) => (
//                 <div
//                   key={user.id}
//                   className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
//                   onClick={() => handleUserClick(user.id as string)}
//                   role="button"
//                   aria-label={`View profile of ${user.name || 'Unnamed User'}`}
//                 >
//                   <img
//                     src={user.profileImage || 'https://via.placeholder.com/40'}
//                     alt={user.name || 'User'}
//                     className="w-10 h-10 rounded-full object-cover mr-3"
//                   />
//                   <div>
//                     <p className="text-sm font-medium text-foreground">{user.name || 'Unnamed User'}</p>
//                     <p className="text-xs text-muted-foreground">{user.profession || user.role || 'No profession'}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <UserProfileModal
//         isOpen={!!selectedUserId}
//         onClose={() => setSelectedUserId(null)}
//         userId={selectedUserId || ''}
//       />
//     </>
//   );
// };

// export default UserListModal;