// import React, { useState, useEffect } from 'react';
// import { X, User, Briefcase } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import authService from '../../services/user/authService';
// import { IUser, UserRole } from '../../types/auth/auth.types';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../redux/app/store';

// interface UserProfileModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   userId: string;
// }

// const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, userId }) => {
//   const navigate = useNavigate();
//   const currentUser = useSelector((state: RootState) => state.tempUser.tempUser) as IUser | null;
//   const [user, setUser] = useState<IUser | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const maxRetries = 2;

//   useEffect(() => {
//     if (!isOpen || !userId) {
//       setUser(null);
//       setError(null);
//       setIsLoading(false);
//       setRetryCount(0);
//       return;
//     }

//     const fetchUser = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         const fetchedUser = await authService.getUserById(userId);
//         if (!fetchedUser) {
//           if (retryCount < maxRetries) {
//             setRetryCount(prev => prev + 1);
//             setTimeout(fetchUser, 1000); // Retry after 1 second
//             return;
//           }
//           throw new Error('User not found');
//         }
//         setUser(fetchedUser);
//       } catch (err: any) {
//         console.error('Error fetching user:', err);
//         setError(err.message || 'Failed to load user profile');
//         toast.error(err.message || 'Failed to load user profile');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUser();
//   }, [isOpen, userId, retryCount]);

//   const handleFollowToggle = async () => {
//     if (!currentUser || !user || !currentUser.id) {
//       toast.error('You must be logged in to follow/unfollow');
//       return;
//     }

//     try {
//       const isFollowing = user.followers?.includes(currentUser.id) || false;
//       const action = isFollowing ? 'unfollow' : 'follow';
//       await authService.followToggle(user.id, action);
//       setUser(prev => {
//         if (!prev) return prev;
//         const updatedFollowers = isFollowing
//           ? prev.followers?.filter(id => id !== currentUser.id) ?? []
//           : [...(prev.followers ?? []), currentUser.id];
//         return { ...prev, followers: updatedFollowers };
//       });
//       toast.success(isFollowing ? 'Unfollowed user' : 'Followed user');
//     } catch (err: any) {
//       console.error('Error toggling follow:', err);
//       toast.error(err.message || 'Failed to update follow status');
//     }
//   };

//   const handleMessage = () => {
//     if (!user) return;
//     navigate(`/messages/${user.id}`);
//   };

//   return (
//     <div
//       className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
//         isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
//       }`}
//       role="dialog"
//       aria-labelledby="user-profile-modal-title"
//       aria-modal="true"
//     >
//       <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//       <div className="relative w-full max-w-2xl bg-background rounded-xl shadow-xl p-8 max-h-[90vh] overflow-y-auto">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
//           aria-label="Close modal"
//         >
//           <X className="w-6 h-6" />
//         </button>

//         {isLoading ? (
//           <div className="text-center py-10">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
//             <p className="text-muted-foreground mt-2">Loading profile...</p>
//           </div>
//         ) : error ? (
//           <div className="text-center py-10 text-destructive">
//             {error}
//             <button
//               onClick={() => setRetryCount(0)}
//               className="mt-4 text-primary underline"
//               aria-label="Retry loading profile"
//             >
//               Retry
//             </button>
//           </div>
//         ) : !user ? (
//           <div className="text-center py-10 text-muted-foreground">User not found</div>
//         ) : (
//           <div className="space-y-6">
//             {/* Profile Header */}
//             <div className="flex items-center space-x-6">
//               <img
//                 src={user.profileImage || 'https://via.placeholder.com/100'}
//                 alt={user.name || 'User'}
//                 className="w-24 h-24 rounded-full object-cover border-2 border-border"
//               />
//               <div>
//                 <h2 id="user-profile-modal-title" className="text-2xl font-semibold text-foreground">
//                   {user.name || 'Unnamed User'}
//                 </h2>
//                 <p className="text-sm text-muted-foreground">{user.profession || user.role || 'No profession'}</p>
//                 <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
//               </div>
//             </div>

//             {/* Bio */}
//             <p className="text-foreground whitespace-pre-line">{user.bio || 'No bio available.'}</p>

//             {/* Stats */}
//             <div className="flex space-x-8">
//               <div
//                 className="cursor-pointer hover:text-primary"
//                 onClick={() => navigate(`/profile/${user.id}/followers`)}
//                 role="button"
//                 aria-label={`View ${user.followers?.length || 0} followers`}
//               >
//                 <span className="font-semibold text-foreground">{user.followers?.length || 0}</span>
//                 <span className="text-muted-foreground ml-1">Followers</span>
//               </div>
//               <div
//                 className="cursor-pointer hover:text-primary"
//                 onClick={() => navigate(`/profile/${user.id}/following`)}
//                 role="button"
//                 aria-label={`View ${user.following?.length || 0} following`}
//               >
//                 <span className="font-semibold text-foreground">{user.following?.length || 0}</span>
//                 <span className="text-muted-foreground ml-1">Following</span>
//               </div>
//               <div>
//                 <span className="font-semibold text-foreground">{user.posts?.length || 0}</span>
//                 <span className="text-muted-foreground ml-1">Posts</span>
//               </div>
//             </div>

//             {/* Actions */}
//             {currentUser && currentUser.id !== user.id && (
//               <div className="flex space-x-4">
//                 <button
//                   onClick={handleFollowToggle}
//                   className={`px-4 py-2 rounded-md ${
//                     user.followers?.includes(currentUser.id)
//                       ? 'bg-muted text-foreground'
//                       : 'bg-primary text-primary-foreground hover:bg-primary/90'
//                   }`}
//                   disabled={!currentUser.id}
//                   aria-label={user.followers?.includes(currentUser.id) ? 'Unfollow user' : 'Follow user'}
//                 >
//                   {user.followers?.includes(currentUser.id) ? 'Unfollow' : 'Follow'}
//                 </button>
//                 <button
//                   onClick={handleMessage}
//                   className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-accent"
//                   aria-label="Send message"
//                 >
//                   Message
//                 </button>
//               </div>
//             )}

//             {/* Additional Info */}
//             {user.role === UserRole.INVESTOR && user.investorDetails && (
//               <div className="bg-muted p-4 rounded-lg">
//                 <h3 className="text-lg font-semibold mb-2 flex items-center text-foreground">
//                   <Briefcase className="mr-2 text-primary" /> Company Information
//                 </h3>
//                 <p>
//                   <span className="font-medium">Company:</span>{' '}
//                   {user.investorDetails.companyName || 'N/A'}
//                 </p>
//                 <p>
//                   <span className="font-medium">Founded:</span>{' '}
//                   {user.investorDetails.companyFounded || 'N/A'}
//                 </p>
//                 <p>
//                   <span className="font-medium">Registration:</span>{' '}
//                   {user.investorDetails.companyRegistration || 'N/A'}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserProfileModal;