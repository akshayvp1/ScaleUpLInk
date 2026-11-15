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
import { PageHeader } from "../../common/PageHeader";

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
  active: "bg-success/10 text-success",
  blocked: "bg-destructive/10 text-destructive",
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
    <div className="w-full space-y-6">
      <PageHeader
        title="Post management"
        description="Moderate reported content and keep the community feed healthy."
        actions={
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
            {posts.length} posts
          </Badge>
        }
      />

      <div className="flex items-center space-x-2">
        <div className="relative w-full max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid gap-3 md:hidden">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-border/70 bg-card p-4 shadow-soft"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.imageUrl} alt={post.username} />
                <AvatarFallback>
                  {post.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{post.username}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={post.reportCount > 10 ? "destructive" : "outline"}>
                {post.reportCount} reports
              </Badge>
              <Badge className={statusStyles[post.status]}>
                {post.status === "active" ? "Active" : "Blocked"}
              </Badge>
            </div>
            <div className="mt-3">
              {post.status === "active" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-destructive border-destructive/20 hover:bg-destructive/5"
                  onClick={() => handleBlockUser(post.id)}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Block
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-success border-success/20 hover:bg-success/5"
                  onClick={() => handleUnblockUser(post.id)}
                >
                  <Unlock className="h-4 w-4 mr-1" />
                  Unblock
                </Button>
              )}
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No posts found matching your search.
          </p>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-soft md:block">
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
                      className="text-destructive border-destructive/20 hover:bg-destructive/5"
                      onClick={() => handleBlockUser(post.id)}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Block
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-success border-success/20 hover:bg-success/5"
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