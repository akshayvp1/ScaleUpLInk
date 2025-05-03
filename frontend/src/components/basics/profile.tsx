
// import React, { useState, useRef, useEffect } from 'react';
// import { toast } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import { 
//   Edit, Briefcase, Calendar, MapPin, X, User, Plus, UploadCloud,
//   Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
//   ChevronLeft, ChevronRight, Settings
// } from 'lucide-react';
// import axios from 'axios';
// import authService from '../../services/user/authService';
// import { IUser, UserRole } from '../../types/auth/auth.types';
// import postService from '../../services/post/postService';
// import { Post, Comment } from '../../types/post/post.types';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../redux/app/store';
// import { setTempUser } from '../../redux/features/auth/tempSlice';

// // Extend ProfileData from IUser and ensure 'type' is required
// interface ProfileData extends IUser {
//   type: UserRole;
// }

// interface ExtendedComment extends Comment {
//   userId: string; 
//   user?: IUser;   
// }

// // Define ExtendedPost interface to use ExtendedComment
// interface ExtendedPost extends Post {
//   comments: ExtendedComment[];
// }

// // Interface for ChangePasswordModal props
// interface ChangePasswordModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// // Change Password Modal Component
// const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handlePasswordChange = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!currentPassword || !newPassword || !confirmPassword) {
//       setError('All fields are required');
//       toast.error('All fields are required');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('New password and confirm password do not match');
//       toast.error('Passwords do not match');
//       return;
//     }

//     if (newPassword.length < 8) {
//       setError('New password must be at least 8 characters long');
//       toast.error('New password must be at least 8 characters');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
      
//       await authService.changeOldPassword(currentPassword, newPassword);
//       toast.success('Password changed successfully!');
//       setCurrentPassword('');
//       setNewPassword('');
//       setConfirmPassword('');
//       onClose();
//     } catch (err) {
//       console.error('Error changing password:', err);
//       setError('Failed to change password. Please check your current password.');
//       toast.error('Failed to change password');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
//       <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//       <div className="relative w-full max-w-md bg-background rounded-xl shadow-xl p-6">
//         <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
//           <X className="w-6 h-6" />
//         </button>
//         <h3 className="text-xl font-semibold text-foreground mb-6">Change Password</h3>
//         <form onSubmit={handlePasswordChange} className="space-y-4">
//           {error && (
//             <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-md">
//               {error}
//             </div>
//           )}
//           <div>
//             <label className="block text-sm font-medium text-foreground">Current Password</label>
//             <input
//               type="password"
//               value={currentPassword}
//               onChange={(e) => setCurrentPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-foreground">New Password</label>
//             <input
//               type="password"
//               value={newPassword}
//               onChange={(e) => setNewPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
//             <input
//               type="password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
//               required
//             />
//           </div>
//           <div className="flex justify-end space-x-4 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-md"
//               disabled={isSubmitting}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? 'Changing...' : 'Change Password'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const ProfileComponent: React.FC = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [posts, setPosts] = useState<ExtendedPost[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedPost, setSelectedPost] = useState<ExtendedPost | null>(null);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [commentText, setCommentText] = useState('');
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const currentTempUser = useSelector((state: RootState) => state.tempUser.tempUser) as IUser | null;

//   const defaultProfileData: ProfileData = {
//     type: UserRole.ENTREPRENEUR,
//     name: 'Guest User',
//     email: '',
//     followers: [],
//     following: [],
//   };

//   const [profileData, setProfileData] = useState<ProfileData>(
//     currentTempUser ? { ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR } : defaultProfileData
//   );
//   const [editableProfile, setEditableProfile] = useState<ProfileData>(profileData);

//   useEffect(() => {
//     if (currentTempUser) {
//       setProfileData({ ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR });
//       setEditableProfile({ ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR });
//     }
//   }, [currentTempUser]);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       setIsLoading(true);
//       try {
//         const fetchedPosts = await postService.getPost();
//         const transformedPosts: ExtendedPost[] = fetchedPosts.map(post => ({
//           ...post,
//           userid: typeof post.userid === 'object' ? post.userid : post.userid,
//           comments: post.comments.map(comment => ({
//             ...comment,
//             user: typeof comment.userId === 'object' ? comment.userId : undefined
//           })) as ExtendedComment[]
//         }));
//         setPosts(transformedPosts);
//         console.log('Transformed posts:', JSON.stringify(transformedPosts, null, 2));
//       } catch (error) {
//         console.error('Error fetching posts:', error);
//         setError('Failed to load posts');
//         toast.error('Failed to load posts');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchPosts();
//     setImageError(false);
//   }, []);

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error('Image size should be less than 5MB');
//       return;
//     }

//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "ad-upload");
//       formData.append("folder", "scaleuplink/profile");
//       const response = await axios.post(
//         `https://api.cloudinary.com/v1_1/dedrcfbxf/image/upload`,
//         formData
//       );
      
//       setEditableProfile(prev => ({
//         ...prev,
//         profileImage: response.data.secure_url
//       }));
//       toast.success("Profile image uploaded successfully!");
//     } catch (error) {
//       console.error('Image upload error:', error);
//       toast.error('Failed to upload image');
//     } finally {
//       setIsUploading(false);
//     }
//   };
 
//   const handleSaveProfile = async () => {
//     try {
//       if (!editableProfile.name) {
//         toast.error("Name cannot be empty");
//         return;
//       }

//       const updateData = {
//         name: editableProfile.name,
//         contactNumber: editableProfile.contactNumber,
//         profileImage: editableProfile.profileImage,
//         bio: editableProfile.bio,
//         email: editableProfile.email
//       };
      
//       await authService.updateDetail(updateData);
//       setProfileData(editableProfile);
//       dispatch(setTempUser({ tempUser: editableProfile }));
//       toast.success("Profile updated successfully!");
//       setIsEditModalOpen(false);
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       toast.error("Failed to save profile changes");
//     }
//   };

//   const handleLikePost = async (postId: string) => {
//     try {
//       const updatedPost = await postService.likePost(postId);
//       const enrichedPost: ExtendedPost = {
//         ...updatedPost,
//         userid: posts.find(p => p._id === postId)?.userid || updatedPost.userid,
//         comments: updatedPost.comments.map(comment => ({
//           ...comment,
//           user: typeof comment.userId === 'object' 
//             ? comment.userId 
//             : posts.find(p => p._id === postId)?.comments.find(c => c._id === comment._id)?.user
//         })) as ExtendedComment[]
//       };
//       setPosts(posts.map(p => p._id === postId ? enrichedPost : p));
//       if (selectedPost?._id === postId) {
//         setSelectedPost(enrichedPost);
//       }
//       toast.success("Post liked!");
//     } catch (error) {
//       console.error('Error liking post:', error);
//       toast.error('Failed to like post');
//     }
//   };

//   const handleComment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!commentText.trim() || !selectedPost || !currentTempUser) return;

//     try {
//       const updatedPost = await postService.addComment(selectedPost._id!, commentText);
//       const enrichedPost: ExtendedPost = {
//         ...updatedPost,
//         userid: posts.find(p => p._id === selectedPost._id)?.userid || updatedPost.userid,
//         comments: updatedPost.comments.map(comment => {
//           // For the new comment, use currentTempUser data
//           if (!comment._id || !posts.find(p => p._id === selectedPost._id)?.comments.some(c => c._id === comment._id)) {
//             return {
//               ...comment,
//               user: {
//                 id: currentTempUser.id,
//                 name: currentTempUser.name || 'Unknown',
//                 profileImage: currentTempUser.profileImage || ''
//               }
//             };
//           }
//           // For existing comments, preserve or populate user data
//           return {
//             ...comment,
//             user: typeof comment.userId === 'object' 
//               ? comment.userId 
//               : posts.find(p => p._id === selectedPost._id)?.comments.find(c => c._id === comment._id)?.user
//           };
//         }) as ExtendedComment[]
//       };
//       setPosts(posts.map(p => p._id === selectedPost._id ? enrichedPost : p));
//       setSelectedPost(enrichedPost);
//       setCommentText('');
//       toast.success("Comment added!");
//     } catch (error) {
//       console.error('Error adding comment:', error);
//       toast.error('Failed to add comment');
//     }
//   };

//   const renderProfileHeader = () => (
//     <div className="px-6 py-8">
//       <div className="flex flex-col md:flex-row items-center md:items-start">
//         <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
//           {profileData.profileImage && !imageError ? (
//             <img 
//               src={profileData.profileImage}
//               alt={profileData.name || 'User'}
//               className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover ring-2 ring-border"
//               onError={() => setImageError(true)}
//             />
//           ) : (
//             <button 
//               onClick={() => setIsEditModalOpen(true)}
//               className="w-24 h-24 md:w-36 md:h-36 rounded-full border-2 border-border bg-muted flex items-center justify-center hover:bg-muted/80"
//               type="button"
//             >
//               <Plus className="w-10 h-10 text-muted-foreground" />
//             </button>
//           )}
//         </div>
//         <div className="flex-grow text-center md:text-left">
//           <div className="flex flex-col md:flex-row md:items-center mb-4">
//             <h1 className="text-xl font-medium text-foreground mb-2 md:mb-0 md:mr-4">
//               {profileData.name || 'Unnamed User'}
//             </h1>
//             <div className="flex justify-center md:justify-start space-x-2">
//               <button 
//                 onClick={() => setIsEditModalOpen(true)}
//                 className="px-4 py-1 border border-border rounded-md font-medium text-sm text-foreground hover:bg-accent"
//                 type="button"
//               >
//                 Edit Profile
//               </button>
//               <button 
//                 onClick={() => setIsChangePasswordModalOpen(true)}
//                 className="p-1 rounded-md hover:bg-accent" 
//                 type="button"
//               >
//                 <Settings className="w-6 h-6 text-foreground" />
//               </button>
//             </div>
//           </div>
//           <div className="flex justify-center md:justify-start space-x-6 md:space-x-10 mb-4">
//             <div>
//               <span className="font-semibold text-foreground">{posts.length}</span>
//               <span className="text-muted-foreground ml-1">posts</span>
//             </div>
//             <div>
//               <span className="font-semibold text-foreground">{profileData.followers?.length || 0}</span>
//               <span className="text-muted-foreground ml-1">followers</span>
//             </div>
//             <div>
//               <span className="font-semibold text-foreground">{profileData.following?.length || 0}</span>
//               <span className="text-muted-foreground ml-1">following</span>
//             </div>
//           </div>
//           <div className="text-sm">
//             <p className="font-semibold text-foreground">{profileData.profession || profileData.role || ''}</p>
//             <p className="mt-1 whitespace-pre-line text-foreground">{profileData.bio || 'No bio yet.'}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderEditModal = () => (
//     <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isEditModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
//       <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
//       <div className="relative w-full max-w-2xl bg-background rounded-xl shadow-xl p-6">
//         <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
//           <X className="w-6 h-6" />
//         </button>
//         <h3 className="text-xl font-semibold text-foreground mb-6">Edit Profile</h3>
//         <div className="flex flex-col md:flex-row md:space-x-8">
//           <div className="flex justify-center mb-6 md:mb-0">
//             <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
//             {editableProfile.profileImage && !imageError ? (
//               <div className="relative">
//                 <img 
//                   src={editableProfile.profileImage}
//                   alt="Profile"
//                   className="w-40 h-40 rounded-full object-cover border-2 border-border cursor-pointer"
//                   onError={() => setImageError(true)}
//                   onClick={() => fileInputRef.current?.click()}
//                 />
//                 <span className="absolute bottom-2 right-2 bg-muted text-foreground text-xs px-2 py-1 rounded">Change</span>
//               </div>
//             ) : (
//               <button 
//                 onClick={() => fileInputRef.current?.click()}
//                 className="w-40 h-40 rounded-full border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center hover:bg-muted/80"
//                 disabled={isUploading}
//                 type="button"
//               >
//                 {isUploading ? (
//                   <UploadCloud className="w-12 h-12 text-muted-foreground animate-spin" />
//                 ) : (
//                   <>
//                     <UploadCloud className="w-12 h-12 text-muted-foreground" />
//                     <span className="text-sm text-muted-foreground">Upload Photo</span>
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//           <div className="space-y-4 flex-grow">
//             <div>
//               <label className="block text-sm font-medium text-foreground">Name</label>
//               <input 
//                 type="text" 
//                 value={editableProfile.name || ''} 
//                 onChange={(e) => setEditableProfile(prev => ({ ...prev, name: e.target.value || null }))}
//                 className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-foreground">Bio</label>
//               <textarea
//                 value={editableProfile.bio || ''}
//                 onChange={(e) => setEditableProfile(prev => ({ ...prev, bio: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
//                 rows={3}
//                 maxLength={150}
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-foreground">Contact Number</label>
//               <input 
//                 type="text" 
//                 value={editableProfile.contactNumber || ''}
//                 onChange={(e) => setEditableProfile(prev => ({ ...prev, contactNumber: e.target.value }))}
//                 className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
//               />
//             </div>
//           </div>
//         </div>
//         <div className="mt-6 flex justify-end space-x-4">
//           <button 
//             onClick={() => setIsEditModalOpen(false)}
//             className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-md"
//             type="button"
//           >
//             Cancel
//           </button>
//           <button 
//             onClick={handleSaveProfile}
//             className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
//             type="button"
//           >
//             Save Changes
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPostModal = () => (
//     <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${selectedPost ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
//       <div className="absolute inset-0 bg-black/90" onClick={() => setSelectedPost(null)} />
//       <div className="relative w-full max-w-5xl bg-background rounded-lg flex">
//         <div className="w-3/5 bg-black flex items-center justify-center relative">
//           {selectedPost?.media && selectedPost.media.length > 0 ? (
//             <img 
//               src={selectedPost.media[currentImageIndex]}
//               alt="Post"
//               className="max-w-full max-h-screen object-contain"
//             />
//           ) : (
//             <p className="text-muted-foreground">No Image Available</p>
//           )}
//           {selectedPost?.media && selectedPost.media.length > 1 && (
//             <>
//               <button 
//                 onClick={() => setCurrentImageIndex(prev => prev === 0 ? selectedPost.media!.length - 1 : prev - 1)}
//                 className="absolute left-2 p-2 rounded-full bg-black/50 text-foreground hover:bg-black/70"
//                 type="button"
//               >
//                 <ChevronLeft className="w-6 h-6" />
//               </button>
//               <button 
//                 onClick={() => setCurrentImageIndex(prev => prev === selectedPost.media!.length - 1 ? 0 : prev + 1)}
//                 className="absolute right-2 p-2 rounded-full bg-black/50 text-foreground hover:bg-black/70"
//                 type="button"
//               >
//                 <ChevronRight className="w-6 h-6" />
//               </button>
//             </>
//           )}
//         </div>
//         <div className="w-2/5 flex flex-col">
//           <div className="flex items-center p-4 border-b border-border">
//             <img 
//               src={typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).profileImage || 'https://via.placeholder.com/32' : 'https://via.placeholder.com/32'}
//               alt={typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
//               className="w-8 h-8 rounded-full mr-3 object-cover"
//             />
//             <p className="font-semibold text-sm text-foreground flex-grow">
//               {typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
//             </p>
//             <button type="button">
//               <MoreHorizontal className="w-5 h-5 text-foreground" />
//             </button>
//           </div>
//           <div className="flex-grow overflow-y-auto p-4">
//             {selectedPost && (
//               <div className="mb-4">
//                 <div className="flex mb-3">
//                   <img 
//                     src={typeof selectedPost.userid === 'object' ? (selectedPost.userid as IUser).profileImage || 'https://via.placeholder.com/32' : 'https://via.placeholder.com/32'}
//                     alt={typeof selectedPost.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
//                     className="w-8 h-8 rounded-full mr-3 object-cover"
//                   />
//                   <div>
//                     <p>
//                       <span className="font-semibold text-sm text-foreground">
//                         {typeof selectedPost.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
//                       </span>{' '}
//                       <span className="text-sm text-foreground">{selectedPost.content}</span>
//                     </p>
//                     <p className="text-xs text-muted-foreground mt-1">
//                       {selectedPost.createdAt?.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//             {selectedPost?.comments.map((comment: ExtendedComment) => (
//               <div key={comment._id} className="flex mb-4">
//                 <img 
//                   src={comment.user?.profileImage || 'https://via.placeholder.com/32'}
//                   alt={comment.user?.name ?? 'Commenter'}
//                   className="w-8 h-8 rounded-full mr-3 object-cover"
//                 />
//                 <div>
//                   <p>
//                     <span className="font-semibold text-sm text-foreground">
//                       {comment.user?.name ?? 'Unknown'}
//                     </span>{' '}
//                     <span className="text-sm text-foreground">{comment.commentText}</span>
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {new Date(comment.createdAt).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="p-4 border-t border-border">
//             <div className="flex justify-between mb-3">
//               <div className="flex space-x-4">
//                 <button 
//                   type="button" 
//                   onClick={() => selectedPost?._id && handleLikePost(selectedPost._id)}
//                   className="text-foreground hover:text-red-500"
//                 >
//                   <Heart 
//                     className={`w-6 h-6 ${selectedPost?.likes.includes(currentTempUser?.id || '') ? 'fill-current text-red-500' : ''}`} 
//                   />
//                 </button>
//                 <button type="button" className="text-foreground hover:text-primary">
//                   <MessageCircle className="w-6 h-6" />
//                 </button>
//                 <button type="button" className="text-foreground hover:text-primary">
//                   <Share2 className="w-6 h-6" />
//                 </button>
//               </div>
//               <button type="button" className="text-foreground hover:text-primary">
//                 <Bookmark className={`w-6 h-6 ${profileData.savedPost?.includes(selectedPost?._id || '') ? 'fill-current' : ''}`} />
//               </button>
//             </div>
//             <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.likes?.length || 0} likes</p>
//             <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.comments.length || 0} comments</p>
//             <form onSubmit={handleComment} className="flex mt-2">
//               <input
//                 type="text"
//                 placeholder="Add a comment..."
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 className="flex-grow bg-transparent focus:outline-none text-sm text-foreground"
//               />
//               <button
//                 type="submit"
//                 disabled={!commentText.trim()}
//                 className={`text-primary font-semibold text-sm ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 Post
//               </button>
//             </form>
//           </div>
//         </div>
//         <button 
//           onClick={() => setSelectedPost(null)}
//           className="absolute top-4 right-4 p-1 rounded-full bg-background text-foreground hover:bg-muted"
//           type="button"
//         >
//           <X className="w-6 h-6" />
//         </button>
//       </div>
//     </div>
//   );

//   const renderPosts = () => {
//     if (isLoading) return <div className="text-center py-10 text-muted-foreground">Loading posts...</div>;
//     if (error) return <div className="text-center py-10 text-destructive">Error: {error}</div>;
//     if (!posts.length) return <div className="text-center py-10 text-muted-foreground">No posts available yet.</div>;

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//         {posts.map((post) => (
//           <div 
//             key={post._id} 
//             className="bg-background rounded-lg shadow hover:shadow-lg transition cursor-pointer"
//             onClick={() => setSelectedPost(post)}
//           >
//             {post.media?.length ? (
//               <img 
//                 src={post.media[0]}
//                 alt={post.content || 'Post Image'}
//                 className="w-full h-64 object-cover rounded-lg"
//                 onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=Image+Not+Found'}
//               />
//             ) : (
//               <div className="w-full h-64 bg-muted flex items-center justify-center rounded-lg">
//                 <p className="text-muted-foreground">No Image</p>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-4xl mx-auto bg-background min-h-screen">
//       {renderProfileHeader()}
//       <div className="flex border-b border-border">
//         <button 
//           onClick={() => setActiveTab('posts')}
//           className={`flex-1 py-3 text-center ${
//             activeTab === 'posts' 
//               ? 'border-b-2 border-primary text-primary' 
//               : 'text-muted-foreground hover:text-foreground'
//           }`}
//           type="button"
//         >
//           Posts
//         </button>
//         <button 
//           onClick={() => setActiveTab('about')}
//           className={`flex-1 py-3 text-center ${
//             activeTab === 'about' 
//               ? 'border-b-2 border-primary text-primary' 
//               : 'text-muted-foreground hover:text-foreground'
//           }`}
//           type="button"
//         >
//           About
//         </button>
//       </div>
//       <div className="p-6 space-y-6">
//         {activeTab === 'about' ? (
//           <div className="space-y-6">
//             <div className="bg-background shadow rounded-lg p-6">
//               <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
//                 <User className="mr-3 text-primary" />Basic Information
//               </h2>
//               <div className="space-y-3">
//                 <p className="text-foreground"><span className="font-medium">Bio:</span> {profileData.bio || 'No bio'}</p>
//                 <p className="text-foreground"><span className="font-medium">Profession:</span> {profileData.profession || 'Not specified'}</p>
//                 <p className="text-foreground"><span className="font-medium">Contact:</span> {profileData.contactNumber || 'Not specified'}</p>
//                 <p className="text-foreground"><span className="font-medium">Email:</span> {profileData.email || 'Not specified'}</p>
//               </div>
//             </div>
//             {profileData.role === UserRole.INVESTOR && (
//               <div className="bg-background shadow rounded-lg p-6">
//                 <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
//                   <Briefcase className="mr-3 text-primary" />Company Information
//                 </h2>
//                 <div className="space-y-3">
//                   <p className="text-foreground"><span className="font-medium">Company:</span> {profileData.investorDetails?.companyName || 'N/A'}</p>
//                   <p className="text-foreground"><span className="font-medium">Founded:</span> {profileData.investorDetails?.companyFounded || 'N/A'}</p>
//                   <p className="text-foreground"><span className="font-medium">Registration:</span> {profileData.investorDetails?.companyRegistration || 'N/A'}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         ) : (
//           renderPosts()
//         )}
//       </div>
//       {renderEditModal()}
//       {renderPostModal()}
//       <ChangePasswordModal 
//         isOpen={isChangePasswordModalOpen} 
//         onClose={() => setIsChangePasswordModalOpen(false)} 
//       />
//     </div>
//   );
// };

// export default ProfileComponent;



import React, { useState, useRef, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  Edit, Briefcase, User, Plus, UploadCloud,
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ChevronLeft, ChevronRight, Settings, X
} from 'lucide-react';
import axios from 'axios';
import authService from '../../services/user/authService';
import { IUser, UserRole } from '../../types/auth/auth.types';
import postService from '../../services/post/postService';
import { Post, Comment } from '../../types/post/post.types';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/app/store';
import { setTempUser } from '../../redux/features/auth/tempSlice';

// Extend ProfileData from IUser and ensure 'type' is required
interface ProfileData extends IUser {
  type: UserRole;
}

interface ExtendedComment extends Comment {
  userId: string; 
  user?: IUser;   
}

interface ExtendedPost extends Post {
  comments: ExtendedComment[];
}

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: IUser[];
  isLoading: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changeOldPassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your current password.');
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-xl shadow-xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-foreground mb-6">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-md"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, title, users, isLoading }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background rounded-xl shadow-xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-foreground mb-6">{title}</h3>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground text-center">No {title.toLowerCase()} yet.</p>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => handleUserClick(user.id as string)}
              >
                <img
                  src={user.profileImage || 'https://via.placeholder.com/40'}
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name || 'Unnamed User'}</p>
                  <p className="text-xs text-muted-foreground">{user.profession || user.role || 'No profession'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [userListType, setUserListType] = useState<'Followers' | 'Following'>('Followers');
  const [userList, setUserList] = useState<IUser[]>([]);
  const [isUserListLoading, setIsUserListLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [posts, setPosts] = useState<ExtendedPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<ExtendedPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTempUser = useSelector((state: RootState) => state.tempUser.tempUser) as IUser | null;

  const defaultProfileData: ProfileData = {
    type: UserRole.ENTREPRENEUR,
    name: 'Guest User',
    email: '',
    followers: [],
    following: [],
  };

  const [profileData, setProfileData] = useState<ProfileData>(
    currentTempUser ? { ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR } : defaultProfileData
  );
  const [editableProfile, setEditableProfile] = useState<ProfileData>(profileData);

  useEffect(() => {
    if (currentTempUser) {
      setProfileData({ ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR });
      setEditableProfile({ ...currentTempUser, type: currentTempUser.role ?? UserRole.ENTREPRENEUR });
    }
  }, [currentTempUser]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const fetchedPosts = await postService.getPost();
        const transformedPosts: ExtendedPost[] = fetchedPosts.map(post => ({
          ...post,
          userid: typeof post.userid === 'object' ? post.userid : post.userid,
          comments: post.comments.map(comment => ({
            ...comment,
            user: typeof comment.userId === 'object' ? comment.userId : undefined
          })) as ExtendedComment[]
        }));
        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts');
        toast.error('Failed to load posts');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
    setImageError(false);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ad-upload");
      formData.append("folder", "scaleuplink/profile");
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dedrcfbxf/image/upload`,
        formData
      );
      
      setEditableProfile(prev => ({
        ...prev,
        profileImage: response.data.secure_url
      }));
      toast.success("Profile image uploaded successfully!");
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!editableProfile.name) {
        toast.error("Name cannot be empty");
        return;
      }

      const updateData = {
        name: editableProfile.name,
        contactNumber: editableProfile.contactNumber,
        profileImage: editableProfile.profileImage,
        bio: editableProfile.bio,
        email: editableProfile.email
      };
      
      await authService.updateDetail(updateData);
      setProfileData(editableProfile);
      dispatch(setTempUser({ tempUser: editableProfile }));
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const updatedPost = await postService.likePost(postId);
      const enrichedPost: ExtendedPost = {
        ...updatedPost,
        userid: posts.find(p => p._id === postId)?.userid || updatedPost.userid,
        comments: updatedPost.comments.map(comment => ({
          ...comment,
          user: typeof comment.userId === 'object' 
            ? comment.userId 
            : posts.find(p => p._id === postId)?.comments.find(c => c._id === comment._id)?.user
        })) as ExtendedComment[]
      };
      setPosts(posts.map(p => p._id === postId ? enrichedPost : p));
      if (selectedPost?._id === postId) {
        setSelectedPost(enrichedPost);
      }
      toast.success("Post liked!");
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedPost || !currentTempUser) return;

    try {
      const updatedPost = await postService.addComment(selectedPost._id!, commentText);
      const enrichedPost: ExtendedPost = {
        ...updatedPost,
        userid: posts.find(p => p._id === selectedPost._id)?.userid || updatedPost.userid,
        comments: updatedPost.comments.map(comment => {
          if (!comment._id || !posts.find(p => p._id === selectedPost._id)?.comments.some(c => c._id === comment._id)) {
            return {
              ...comment,
              user: {
                id: currentTempUser.id,
                name: currentTempUser.name || 'Unknown',
                profileImage: currentTempUser.profileImage || ''
              }
            };
          }
          return {
            ...comment,
            user: typeof comment.userId === 'object' 
              ? comment.userId 
              : posts.find(p => p._id === selectedPost._id)?.comments.find(c => c._id === comment._id)?.user
          };
        }) as ExtendedComment[]
      };
      setPosts(posts.map(p => p._id === selectedPost._id ? enrichedPost : p));
      setSelectedPost(enrichedPost);
      setCommentText('');
      toast.success("Comment added!");
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleOpenUserList = async (type: 'Followers' | 'Following') => {
    setUserListType(type);
    setIsUserListLoading(true);
    try {
      const userIds = type === 'Followers' ? profileData.followers ?? [] : profileData.following ?? [];
      if (!userIds.length) {
        setUserList([]);
        setIsUserListModalOpen(true);
        return;
      }

      const users = await Promise.all(
        userIds.map(async (userId: string): Promise<IUser | null> => {
          const user = await authService.getUserById(userId);
          return user;
        })
      );

      const validUsers = users.filter((user): user is IUser => user !== null);
      setUserList(validUsers);
      setIsUserListModalOpen(true);
    } catch (error) {
      console.error(`Error fetching ${type.toLowerCase()}:`, error);
      toast.error(`Failed to load ${type.toLowerCase()}`);
    } finally {
      setIsUserListLoading(false);
    }
  };

  const renderProfileHeader = () => (
    <div className="px-6 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
          {profileData.profileImage && !imageError ? (
            <img
              src={profileData.profileImage}
              alt={profileData.name || 'User'}
              className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover ring-2 ring-border"
              onError={() => setImageError(true)}
            />
          ) : (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-24 h-24 md:w-36 md:h-36 rounded-full border-2 border-border bg-muted flex items-center justify-center hover:bg-muted/80"
              type="button"
            >
              <Plus className="w-10 h-10 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex-grow text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <h1 className="text-xl font-medium text-foreground mb-2 md:mb-0 md:mr-4">
              {profileData.name || 'Unnamed User'}
            </h1>
            <div className="flex justify-center md:justify-start space-x-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1 border border-border rounded-md font-medium text-sm text-foreground hover:bg-accent"
                type="button"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="p-1 rounded-md hover:bg-accent"
                type="button"
              >
                <Settings className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </div>
          <div className="flex justify-center md:justify-start space-x-6 md:space-x-10 mb-4">
            <div>
              <span className="font-semibold text-foreground">{posts.length}</span>
              <span className="text-muted-foreground ml-1">posts</span>
            </div>
            <div
              className="cursor-pointer hover:text-primary"
              onClick={() => handleOpenUserList('Followers')}
            >
              <span className="font-semibold text-foreground">{profileData.followers?.length || 0}</span>
              <span className="text-muted-foreground ml-1">followers</span>
            </div>
            <div
              className="cursor-pointer hover:text-primary"
              onClick={() => handleOpenUserList('Following')}
            >
              <span className="font-semibold text-foreground">{profileData.following?.length || 0}</span>
              <span className="text-muted-foreground ml-1">following</span>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-foreground">{profileData.profession || profileData.role || ''}</p>
            <p className="mt-1 whitespace-pre-line text-foreground">{profileData.bio || 'No bio yet.'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isEditModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
      <div className="relative w-full max-w-2xl bg-background rounded-xl shadow-xl p-6">
        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-foreground mb-6">Edit Profile</h3>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="flex justify-center mb-6 md:mb-0">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
            {editableProfile.profileImage && !imageError ? (
              <div className="relative">
                <img 
                  src={editableProfile.profileImage}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-2 border-border cursor-pointer"
                  onError={() => setImageError(true)}
                  onClick={() => fileInputRef.current?.click()}
                />
                <span className="absolute bottom-2 right-2 bg-muted text-foreground text-xs px-2 py-1 rounded">Change</span>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-2 border-dashed border-border bg-muted flex flex-col items-center justify-center hover:bg-muted/80"
                disabled={isUploading}
                type="button"
              >
                {isUploading ? (
                  <UploadCloud className="w-12 h-12 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="space-y-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-foreground">Name</label>
              <input 
                type="text" 
                value={editableProfile.name || ''} 
                onChange={(e) => setEditableProfile(prev => ({ ...prev, name: e.target.value || null }))}
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Bio</label>
              <textarea
                value={editableProfile.bio || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
                rows={3}
                maxLength={150}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Contact Number</label>
              <input 
                type="text" 
                value={editableProfile.contactNumber || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, contactNumber: e.target.value }))}
                className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:border-primary"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            onClick={() => setIsEditModalOpen(false)}
            className="px-6 py-2 text-muted-foreground hover:bg-muted rounded-md"
            type="button"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            type="button"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderPostModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${selectedPost ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black/90" onClick={() => setSelectedPost(null)} />
      <div className="relative w-full max-w-5xl bg-background rounded-lg flex">
        <div className="w-3/5 bg-black flex items-center justify-center relative">
          {selectedPost?.media && selectedPost.media.length > 0 ? (
            <img 
              src={selectedPost.media[currentImageIndex]}
              alt="Post"
              className="max-w-full max-h-screen object-contain"
            />
          ) : (
            <p className="text-muted-foreground">No Image Available</p>
          )}
          {selectedPost?.media && selectedPost.media.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? selectedPost.media!.length - 1 : prev - 1)}
                className="absolute left-2 p-2 rounded-full bg-black/50 text-foreground hover:bg-black/70"
                type="button"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === selectedPost.media!.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 p-2 rounded-full bg-black/50 text-foreground hover:bg-black/70"
                type="button"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        <div className="w-2/5 flex flex-col">
          <div className="flex items-center p-4 border-b border-border">
            <img 
              src={typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).profileImage || 'https://via.placeholder.com/32' : 'https://via.placeholder.com/32'}
              alt={typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
            <p className="font-semibold text-sm text-foreground flex-grow">
              {typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
            </p>
            <button type="button">
              <MoreHorizontal className="w-5 h-5 text-foreground" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
            {selectedPost && (
              <div className="mb-4">
                <div className="flex mb-3">
                  <img 
                    src={typeof selectedPost.userid === 'object' ? (selectedPost.userid as IUser).profileImage || 'https://via.placeholder.com/32' : 'https://via.placeholder.com/32'}
                    alt={typeof selectedPost.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
                    className="w-8 h-8 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <p>
                      <span className="font-semibold text-sm text-foreground">
                        {typeof selectedPost.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
                      </span>{' '}
                      <span className="text-sm text-foreground">{selectedPost.content}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleString() : 'Unknown date'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {selectedPost?.comments.map((comment: ExtendedComment) => (
              <div key={comment._id} className="flex mb-4">
                <img 
                  src={comment.user?.profileImage || 'https://via.placeholder.com/32'}
                  alt={comment.user?.name ?? 'Commenter'}
                  className="w-8 h-8 rounded-full mr-3 object-cover"
                />
                <div>
                  <p>
                    <span className="font-semibold text-sm text-foreground">
                      {comment.user?.name ?? 'Unknown'}
                    </span>{' '}
                    <span className="text-sm text-foreground">{comment.commentText}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex justify-between mb-3">
              <div className="flex space-x-4">
                <button 
                  type="button" 
                  onClick={() => selectedPost?._id && handleLikePost(selectedPost._id)}
                  className="text-foreground hover:text-red-500"
                >
                  <Heart 
                    className={`w-6 h-6 ${selectedPost?.likes.includes(currentTempUser?.id || '') ? 'fill-current text-red-500' : ''}`} 
                  />
                </button>
                <button type="button" className="text-foreground hover:text-primary">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button type="button" className="text-foreground hover:text-primary">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <button type="button" className="text-foreground hover:text-primary">
                <Bookmark className={`w-6 h-6 ${profileData.savedPost?.includes(selectedPost?._id || '') ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.likes?.length || 0} likes</p>
            <p className="font-semibold text-sm text-foreground mb-2">{selectedPost?.comments.length || 0} comments</p>
            <form onSubmit={handleComment} className="flex mt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-grow bg-transparent focus:outline-none text-sm text-foreground"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`text-primary font-semibold text-sm ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Post
              </button>
            </form>
          </div>
        </div>
        <button 
          onClick={() => setSelectedPost(null)}
          className="absolute top-4 right-4 p-1 rounded-full bg-background text-foreground hover:bg-muted"
          type="button"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderPosts = () => {
    if (isLoading) return <div className="text-center py-10 text-muted-foreground">Loading posts...</div>;
    if (error) return <div className="text-center py-10 text-destructive">Error: {error}</div>;
    if (!posts.length) return <div className="text-center py-10 text-muted-foreground">No posts available yet.</div>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div 
            key={post._id} 
            className="bg-background rounded-lg shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            {post.media?.length ? (
              <img 
                src={post.media[0]}
                alt={post.content || 'Post Image'}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/300?text=Image+Not+Found'}
              />
            ) : (
              <div className="w-full h-64 bg-muted flex items-center justify-center rounded-lg">
                <p className="text-muted-foreground">No Image</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-background min-h-screen">
      {renderProfileHeader()}
      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-center ${
            activeTab === 'posts' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          type="button"
        >
          Posts
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-3 text-center ${
            activeTab === 'about' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          type="button"
        >
          About
        </button>
      </div>
      <div className="p-6 space-y-6">
        {activeTab === 'about' ? (
          <div className="space-y-6">
            <div className="bg-background shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
                <User className="mr-3 text-primary" />Basic Information
              </h2>
              <div className="space-y-3">
                <p className="text-foreground"><span className="font-medium">Bio:</span> {profileData.bio || 'No bio'}</p>
                <p className="text-foreground"><span className="font-medium">Profession:</span> {profileData.profession || 'Not specified'}</p>
                <p className="text-foreground"><span className="font-medium">Contact:</span> {profileData.contactNumber || 'Not specified'}</p>
                <p className="text-foreground"><span className="font-medium">Email:</span> {profileData.email || 'Not specified'}</p>
              </div>
            </div>
            {profileData.role === UserRole.INVESTOR && (
              <div className="bg-background shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-foreground">
                  <Briefcase className="mr-3 text-primary" />Company Information
                </h2>
                <div className="space-y-3">
                  <p className="text-foreground"><span className="font-medium">Company:</span> {profileData.investorDetails?.companyName || 'N/A'}</p>
                  <p className="text-foreground"><span className="font-medium">Founded:</span> {profileData.investorDetails?.companyFounded || 'N/A'}</p>
                  <p className="text-foreground"><span className="font-medium">Registration:</span> {profileData.investorDetails?.companyRegistration || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          renderPosts()
        )}
      </div>
      {renderEditModal()}
      {renderPostModal()}
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
      <UserListModal
        isOpen={isUserListModalOpen}
        onClose={() => setIsUserListModalOpen(false)}
        title={userListType}
        users={userList}
        isLoading={isUserListLoading}
      />
    </div>
  );
};

export default ProfileComponent;