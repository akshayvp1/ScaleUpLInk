// import React, { useState, useRef, useEffect } from 'react';
// import { store } from '../../redux/app/store';
// import { useDispatch } from 'react-redux';
// import { toast } from "react-hot-toast";
// import { useNavigate } from "react-router-dom";
// import { 
//   Edit, 
//   Briefcase, 
//   Calendar, 
//   MapPin, 
//   X,
//   User,
//   Plus,
//   UploadCloud
// } from 'lucide-react';
// import axios from 'axios';
// import authService from '../../services/user/authService';
// import { IUser, UserRole } from '../../types/auth/auth.types';

// // Adjusted ProfileData to align with IUser
// interface ProfileData {
//   type: UserRole;
//   name: string | null; // Allow null to match IUser
//   profileImage?: string;
//   role?: UserRole | null;
//   bio?: string;
//   contactNumber?: string;
//   email?: string;
//   age?: number;
//   profession?: string;
//   investorDetails?: {
//     companyFounded?: number;
//     companyName?: string;
//     companyRegistration?: number;
//   };
// }

// const ProfileComponent: React.FC = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
  
//   const currentTempUser = store.getState().tempUser.tempUser as IUser | null;

//   const defaultProfileData: ProfileData = {
//     type: UserRole.ENTREPRENEUR,
//     name: 'Guest User',
//     profileImage: undefined,
//     role: null,
//     bio: '',
//     contactNumber: '',
//     email: '',
//     profession: '',
//   };

//   const profileData: ProfileData = currentTempUser 
//     ? {
//         type: currentTempUser.role ?? UserRole.ENTREPRENEUR,
//         name: currentTempUser.name ?? 'Guest User', // Provide fallback for null/undefined
//         profileImage: currentTempUser.profileImage,
//         role: currentTempUser.role ?? null,
//         bio: currentTempUser.bio ?? '',
//         contactNumber: currentTempUser.contactNumber ?? '',
//         email: currentTempUser.email ?? '', // Ensure email is never undefined
//         age: currentTempUser.age,
//         profession: currentTempUser.profession,
//         investorDetails: currentTempUser.investorDetails
//       }
//     : defaultProfileData;

//   const [editableProfile, setEditableProfile] = useState<ProfileData>(profileData);

//   useEffect(() => {
//     setImageError(false);
//   }, [profileData.profileImage]);

//   const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "ad-upload");

//       const response = await axios.post(
//         `https://api.cloudinary.com/v1_1/dedrcfbxf/image/upload`,
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );

//       setEditableProfile(prev => ({
//         ...prev,
//         profileImage: response.data.secure_url
//       }));
//       toast.success("Profile image uploaded successfully!");
//     } catch (error) {
//       console.error('Image upload error:', error);
//       toast.error('Failed to upload image. Please try again.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const openFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const handleSaveProfile = async () => {
//     try {
//       const updateData = {
//         name: editableProfile.name,
//         contactNumber: editableProfile.contactNumber,
//         profileImage: editableProfile.profileImage,
//         bio: editableProfile.bio,
//         email: currentTempUser?.email ?? editableProfile.email // Fallback to editableProfile.email if currentTempUser is null
//       };
//       console.log(updateData, "hellooodddddddaaaa");
//       await authService.updateDetail(updateData);
//       toast.success("Profile updated successfully!");
//       navigate("/mainpage/dashboard");
//       setIsEditModalOpen(false);
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       toast.error("Failed to save profile changes");
//     }
//   };

//   const renderProfileImageUpload = () => (
//     <div className="relative">
//       <input 
//         type="file" 
//         ref={fileInputRef}
//         accept="image/*"
//         onChange={handleFileUpload}
//         className="hidden" 
//       />
      
//       {editableProfile.profileImage && !imageError ? (
//         <div className="relative group">
//           <img 
//             src={editableProfile.profileImage}
//             alt="Profile"
//             className="w-40 h-40 rounded-full border-4 border-indigo-500 object-cover shadow-lg group-hover:opacity-75 transition"
//             onError={() => setImageError(true)}
//           />
//           <button 
//             onClick={openFileInput}
//             className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300"
//             disabled={isUploading}
//           >
//             {isUploading ? (
//               <div className="animate-spin">
//                 <UploadCloud className="w-10 h-10 text-white" />
//               </div>
//             ) : (
//               <UploadCloud className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
//             )}
//           </button>
//         </div>
//       ) : (
//         <button 
//           onClick={openFileInput}
//           className="w-40 h-40 rounded-full border-4 border-dashed border-indigo-500 bg-gray-100 flex flex-col items-center justify-center hover:bg-gray-200 transition"
//           disabled={isUploading}
//         >
//           {isUploading ? (
//             <div className="animate-spin">
//               <UploadCloud className="w-12 h-12 text-indigo-500" />
//             </div>
//           ) : (
//             <>
//               <UploadCloud className="w-12 h-12 text-indigo-500 mb-2" />
//               <span className="text-sm text-gray-600">Upload Photo</span>
//             </>
//           )}
//         </button>
//       )}
//     </div>
//   );

//   const renderEditModal = () => (
//     <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none transition-opacity duration-300 ${isEditModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
//       <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsEditModalOpen(false)} />
//       <div className="relative w-full max-w-2xl mx-auto my-6">
//         <div className="border-0 rounded-xl shadow-xl relative flex flex-col w-full bg-white outline-none focus:outline-none">
//           <div className="flex items-start justify-between p-6 border-b border-solid border-gray-300 rounded-t">
//             <h3 className="text-3xl font-semibold text-gray-800">
//               Edit Profile
//             </h3>
//             <button 
//               onClick={() => setIsEditModalOpen(false)} 
//               className="p-1 ml-auto bg-transparent border-0 text-gray-600 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:text-gray-800 transition"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           <div className="relative p-6 flex-auto">
//             <div className="flex space-x-8">
//               <div className="flex-shrink-0">
//                 {renderProfileImageUpload()}
//               </div>
              
//               <div className="flex-grow space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                   <input 
//                     type="text" 
//                     value={editableProfile.name ?? ''} // Handle null case
//                     onChange={(e) => setEditableProfile(prev => ({ ...prev, name: e.target.value || null }))}
//                     className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
//                   <input 
//                     type="text" 
//                     value={editableProfile.contactNumber || ''}
//                     onChange={(e) => setEditableProfile(prev => ({ ...prev, contactNumber: e.target.value }))}
//                     className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
//                   <textarea
//                     value={editableProfile.bio || ''}
//                     onChange={(e) => setEditableProfile(prev => ({ ...prev, bio: e.target.value }))}
//                     className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
//                     rows={3}
//                   />
//                 </div>

//                 {profileData.role !== UserRole.INVESTOR && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
//                     <input 
//                       type="text" 
//                       value={editableProfile.profession || ''}
//                       disabled
//                       onChange={(e) => setEditableProfile(prev => ({ ...prev, profession: e.target.value }))}
//                       className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 rounded-b">
//             <button 
//               onClick={() => setIsEditModalOpen(false)}
//               className="background-transparent px-6 py-2 text-gray-600 text-sm font-bold uppercase hover:bg-gray-100 rounded-md transition mr-4"
//             >
//               Cancel
//             </button>
//             <button 
//               onClick={handleSaveProfile}
//               className="bg-indigo-600 text-white active:bg-indigo-700 font-bold uppercase text-sm px-6 py-3 rounded-md shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
//             >
//               Save Changes
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderProfileHeader = () => (
//     <div className="relative bg-slate-800 text-white">
//       <div className="absolute top-4 right-4 flex space-x-2">
//         <button 
//           onClick={() => setIsEditModalOpen(true)}
//           className="bg-orange-500/20 hover:bg-orange-500/30 p-2 rounded-full transition"
//         >
//           <Edit className="w-5 h-5 text-orange-500" />
//         </button>
//       </div>
      
//       <div className="px-6 py-10 text-center">
//         <div className="flex justify-center mb-4">
//           {profileData.profileImage && !imageError ? (
//             <img 
//               src={profileData.profileImage||currentTempUser?.profileImage}
//               alt={profileData.name ?? 'User'} // Handle null name
//               className="w-32 h-32 rounded-full border-4 border-orange-500 shadow-lg object-cover"
//               onError={() => setImageError(true)}
//             />
//           ) : (
//             <button 
//               onClick={() => setIsEditModalOpen(true)}
//               className="w-32 h-32 rounded-full border-4 border-orange-500 bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
//             >
//               <Plus className="w-12 h-12 text-orange-500" />
//             </button>
//           )}
//         </div>
        
//         <h1 className="text-2xl font-bold text-white">{profileData.name ?? 'Unnamed User'}</h1>
//         <p className="text-sm text-orange-300">{profileData.role || 'No Role'}</p>
//         {profileData.profession && (
//           <p className="text-sm text-gray-300 mt-1">{profileData.profession}</p>
//         )}
//         {imageError && profileData.profileImage && (
//           <p className="text-sm text-red-300 mt-2">Failed to load profile image</p>
//         )}
//       </div>
//     </div>
//   );

//   const renderTabs = () => (
//     <div className="flex border-b border-gray-200">
//       <button 
//         onClick={() => setActiveTab('posts')}
//         className={`flex-1 py-3 text-center ${activeTab === 'posts' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-800'}`}
//       >
//         Posts
//       </button>
//       <button 
//         onClick={() => setActiveTab('about')}
//         className={`flex-1 py-3 text-center ${activeTab === 'about' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-800'}`}
//       >
//         About
//       </button>
//     </div>
//   );

//   const renderBasicInfo = () => (
//     <div className="bg-white shadow rounded-lg p-6">
//       <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-800">
//         <User className="mr-3 text-orange-500" />
//         Basic Information
//       </h2>
//       <div className="space-y-3">
//         <p className="text-slate-800"><span className="font-medium">Bio:</span> {profileData.bio || 'No bio available'}</p>
//         <p className="text-slate-800"><span className="font-medium">Profession:</span> {profileData.profession || 'Not specified'}</p>
//         <p className="text-slate-800"><span className="font-medium">Contact:</span> {profileData.contactNumber || 'Not specified'}</p>
//         <p className="text-slate-800"><span className="font-medium">Email:</span> {profileData.email || 'Not specified'}</p>
//         {profileData.age && (
//           <p className="text-slate-800"><span className="font-medium">Age:</span> {profileData.age}</p>
//         )}
//       </div>
//     </div>
//   );

//   const renderInvestorInfo = () => {
//     if (profileData.role !== UserRole.INVESTOR && profileData.role !== UserRole.ENTREPRENEUR) return null;

//     return (
//       <div className="bg-white shadow rounded-lg p-6 space-y-4">
//         <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-800">
//           <Briefcase className="mr-3 text-orange-500" /> 
//           Company Information
//         </h2>
        
//         <div className="space-y-3">
//           <div className="flex items-center text-slate-800">
//             <Briefcase className="mr-3 text-orange-500 w-5 h-5" />
//             <span>Company: {profileData.investorDetails?.companyName || 'Not specified'}</span>
//           </div>
//           <div className="flex items-center text-slate-800">
//             <Calendar className="mr-3 text-orange-500 w-5 h-5" />
//             <span>Founded: {profileData.investorDetails?.companyFounded || 'Not specified'}</span>
//           </div>
//           <div className="flex items-center text-slate-800">
//             <MapPin className="mr-3 text-orange-500 w-5 h-5" />
//             <span>Registration: {profileData.investorDetails?.companyRegistration || 'Not specified'}</span>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-4xl mx-auto bg-white min-h-screen">
//       {renderProfileHeader()}
//       {renderTabs()}
      
//       <div className="p-6 space-y-6">
//         {activeTab === 'about' ? (
//           <div className="space-y-6">
//             {renderBasicInfo()}
//             {renderInvestorInfo()}
//           </div>
//         ) : (
//           <div className="grid grid-cols-3 gap-2">
//             {[...Array(6)].map((_, index) => (
//               <div key={index} className="aspect-square bg-slate-200 hover:opacity-75 transition relative group">
//                 <img 
//                   src={`https://via.placeholder.com/300?text=Post+${index + 1}`} 
//                   alt={`Post ${index + 1}`}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {renderEditModal()}
//     </div>
//   );
// };

// export default ProfileComponent;
import React, { useState, useRef, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { 
  Edit, Briefcase, Calendar, MapPin, X, User, Plus, UploadCloud,
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ChevronLeft, ChevronRight, Settings
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

// Define ExtendedComment interface
interface ExtendedComment extends Comment {
  userId: string; // Matches base Comment interface
  user?: IUser;   // Optional field for populated user data
}

// Define ExtendedPost interface to use ExtendedComment
interface ExtendedPost extends Post {
  comments: ExtendedComment[];
}

const ProfileComponent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
        console.log('Transformed posts:', JSON.stringify(transformedPosts, null, 2));
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
          // For the new comment, use currentTempUser data
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
          // For existing comments, preserve or populate user data
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

  const renderProfileHeader = () => (
    <div className="px-6 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
          {profileData.profileImage && !imageError ? (
            <img 
              src={profileData.profileImage}
              alt={profileData.name || 'User'}
              className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover ring-2 ring-gray-100"
              onError={() => setImageError(true)}
            />
          ) : (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-24 h-24 md:w-36 md:h-36 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              type="button"
            >
              <Plus className="w-10 h-10 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex-grow text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <h1 className="text-xl font-medium text-gray-900 mb-2 md:mb-0 md:mr-4">
              {profileData.name || 'Unnamed User'}
            </h1>
            <div className="flex justify-center md:justify-start space-x-2">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1 border border-gray-300 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-50"
                type="button"
              >
                Edit Profile
              </button>
              <button className="p-1 rounded-md hover:bg-gray-100" type="button">
                <Settings className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
          <div className="flex justify-center md:justify-start space-x-6 md:space-x-10 mb-4">
            <div>
              <span className="font-semibold">{posts.length}</span>
              <span className="text-gray-700 ml-1">posts</span>
            </div>
            <div>
              <span className="font-semibold">{profileData.followers?.length || 0}</span>
              <span className="text-gray-700 ml-1">followers</span>
            </div>
            <div>
              <span className="font-semibold">{profileData.following?.length || 0}</span>
              <span className="text-gray-700 ml-1">following</span>
            </div>
          </div>
          <div className="text-sm">
            <p className="font-semibold">{profileData.profession || profileData.role || ''}</p>
            <p className="mt-1 whitespace-pre-line">{profileData.bio || 'No bio yet.'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isEditModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={() => setIsEditModalOpen(false)} />
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6">
        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Edit Profile</h3>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="flex justify-center mb-6 md:mb-0">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
            {editableProfile.profileImage && !imageError ? (
              <div className="relative">
                <img 
                  src={editableProfile.profileImage}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border-2 border-gray-200 cursor-pointer"
                  onError={() => setImageError(true)}
                  onClick={() => fileInputRef.current?.click()}
                />
                <span className="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">Change</span>
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 bg-gray-100 flex flex-col items-center justify-center hover:bg-gray-200"
                disabled={isUploading}
                type="button"
              >
                {isUploading ? (
                  <UploadCloud className="w-12 h-12 text-gray-500 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-gray-400" />
                    <span className="text-sm text-gray-500">Upload Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="space-y-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                value={editableProfile.name || ''} 
                onChange={(e) => setEditableProfile(prev => ({ ...prev, name: e.target.value || null }))}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={editableProfile.bio || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-gray-500"
                rows={3}
                maxLength={150}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Number</label>
              <input 
                type="text" 
                value={editableProfile.contactNumber || ''}
                onChange={(e) => setEditableProfile(prev => ({ ...prev, contactNumber: e.target.value }))}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-gray-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button 
            onClick={() => setIsEditModalOpen(false)}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            type="button"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
      <div className="absolute inset-0 bg-black opacity-90" onClick={() => setSelectedPost(null)} />
      <div className="relative w-full max-w-5xl bg-white rounded-lg flex">
        <div className="w-3/5 bg-black flex items-center justify-center relative">
          {selectedPost?.media && selectedPost.media.length > 0 ? (
            <img 
              src={selectedPost.media[currentImageIndex]}
              alt="Post"
              className="max-w-full max-h-screen object-contain"
            />
          ) : (
            <p className="text-gray-400">No Image Available</p>
          )}
          {selectedPost?.media && selectedPost.media.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? selectedPost.media!.length - 1 : prev - 1)}
                className="absolute left-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                type="button"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentImageIndex(prev => prev === selectedPost.media!.length - 1 ? 0 : prev + 1)}
                className="absolute right-2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                type="button"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        <div className="w-2/5 flex flex-col">
          <div className="flex items-center p-4 border-b">
            <img 
              src={typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).profileImage || 'https://via.placeholder.com/32' : 'https://via.placeholder.com/32'}
              alt={typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
            <p className="font-semibold text-sm flex-grow">
              {typeof selectedPost?.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
            </p>
            <button type="button">
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
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
                      <span className="font-semibold text-sm">
                        {typeof selectedPost.userid === 'object' ? (selectedPost.userid as IUser).name ?? 'User' : 'User'}
                      </span>{' '}
                      <span className="text-sm">{selectedPost.content}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedPost.createdAt?.toLocaleString()}
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
                    <span className="font-semibold text-sm">
                      {comment.user?.name ?? 'Unknown'}
                    </span>{' '}
                    <span className="text-sm">{comment.commentText}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="flex justify-between mb-3">
              <div className="flex space-x-4">
                <button 
                  type="button" 
                  onClick={() => selectedPost?._id && handleLikePost(selectedPost._id)}
                  className="text-gray-700 hover:text-red-500"
                >
                  <Heart 
                    className={`w-6 h-6 ${selectedPost?.likes.includes(currentTempUser?.id || '') ? 'fill-current text-red-500' : ''}`} 
                  />
                </button>
                <button type="button" className="text-gray-700 hover:text-gray-900">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button type="button" className="text-gray-700 hover:text-gray-900">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <button type="button" className="text-gray-700 hover:text-gray-900">
                <Bookmark className={`w-6 h-6 ${profileData.savedPost?.includes(selectedPost?._id || '') ? 'fill-current' : ''}`} />
              </button>
            </div>
            <p className="font-semibold text-sm mb-2">{selectedPost?.likes?.length || 0} likes</p>
            <p className="font-semibold text-sm mb-2">{selectedPost?.comments.length || 0} comments</p>
            <form onSubmit={handleComment} className="flex mt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-grow bg-transparent focus:outline-none text-sm"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className={`text-blue-500 font-semibold text-sm ${!commentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Post
              </button>
            </form>
          </div>
        </div>
        <button 
          onClick={() => setSelectedPost(null)}
          className="absolute top-4 right-4 p-1 rounded-full bg-white text-black hover:bg-gray-200"
          type="button"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const renderPosts = () => {
    if (isLoading) return <div className="text-center py-10 text-slate-600">Loading posts...</div>;
    if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    if (!posts.length) return <div className="text-center py-10 text-slate-600">No posts available yet.</div>;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div 
            key={post._id} 
            className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer"
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
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-gray-500">No Image</p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {renderProfileHeader()}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-center ${activeTab === 'posts' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-800'}`}
          type="button"
        >
          Posts
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-3 text-center ${activeTab === 'about' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-slate-800'}`}
          type="button"
        >
          About
        </button>
      </div>
      <div className="p-6 space-y-6">
        {activeTab === 'about' ? (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-800">
                <User className="mr-3 text-orange-500" />Basic Information
              </h2>
              <div className="space-y-3">
                <p className="text-slate-800"><span className="font-medium">Bio:</span> {profileData.bio || 'No bio'}</p>
                <p className="text-slate-800"><span className="font-medium">Profession:</span> {profileData.profession || 'Not specified'}</p>
                <p className="text-slate-800"><span className="font-medium">Contact:</span> {profileData.contactNumber || 'Not specified'}</p>
                <p className="text-slate-800"><span className="font-medium">Email:</span> {profileData.email || 'Not specified'}</p>
              </div>
            </div>
            {profileData.role === UserRole.INVESTOR && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center text-slate-800">
                  <Briefcase className="mr-3 text-orange-500" />Company Information
                </h2>
                <div className="space-y-3">
                  <p><span className="font-medium">Company:</span> {profileData.investorDetails?.companyName || 'N/A'}</p>
                  <p><span className="font-medium">Founded:</span> {profileData.investorDetails?.companyFounded || 'N/A'}</p>
                  <p><span className="font-medium">Registration:</span> {profileData.investorDetails?.companyRegistration || 'N/A'}</p>
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
    </div>
  );
};

export default ProfileComponent;