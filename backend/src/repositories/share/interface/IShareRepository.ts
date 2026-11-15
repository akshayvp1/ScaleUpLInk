export interface IShareRepository {
  addShare(postId: string, userId: string): Promise<{ totalShare: number }>;
  getShareDetails(postId: string, sharedBy?: string): Promise<any | null>;
}