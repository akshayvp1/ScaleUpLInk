import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Lock, Unlock, Search } from "lucide-react";

// Define types for Post
interface Post {
  id: string;
  username: string;
  content: string;
  reportCount: number;
  status: "active" | "blocked";
  imageUrl?: string;
}

// Mock data (replace with API in production)
const initialPosts: Post[] = [
  {
    id: "1",
    username: "john_doe",
    content: "This is a sample post.",
    reportCount: 5,
    status: "active",
    imageUrl: "/api/placeholder/40/40",
  },
  {
    id: "2",
    username: "jane_smith",
    content: "Another post here.",
    reportCount: 12,
    status: "blocked",
    imageUrl: "/api/placeholder/40/40",
  },
  {
    id: "3",
    username: "alice_wonder",
    content: "Hello world!",
    reportCount: 3,
    status: "active",
    imageUrl: "/api/placeholder/40/40",
  },
];

// Status badge styles
const statusStyles = {
  active: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
};

export default function PostManagement() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter posts based on search term
  const filteredPosts = posts.map((post) => ({
    ...post,
    status: post.reportCount > 10 ? ("blocked" as const) : post.status,
  }))
  .filter((post) =>
    post.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle blocking a user
  const handleBlockUser = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: "blocked" } : post
      )
    );
  };

  // Handle unblocking a user
  const handleUnblockUser = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: "active" } : post
      )
    );
  };

  return (
    <div className="w-full px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Post Management</h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search posts..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of all posts in the system.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Image</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.imageUrl} alt={post.username} />
                    <AvatarFallback>
                      {post.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{post.username}</TableCell>
                <TableCell>{post.content}</TableCell>
                <TableCell>
                  <Badge
                    variant={post.reportCount > 10 ? "destructive" : "outline"}
                  >
                    {post.reportCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusStyles[post.status]}>
                    {post.status === "active" ? "Active" : "Blocked"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {post.status === "active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleBlockUser(post.id)}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Block
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleUnblockUser(post.id)}
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
    </div>
  );
}