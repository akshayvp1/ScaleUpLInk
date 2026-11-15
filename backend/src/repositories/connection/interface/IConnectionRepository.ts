import { IConnection, ConnectionStatus } from "../../../interfaces/IConnection";

export interface IConnectionRepository {
  // Finds the one connection doc between two users, regardless of who
  // sent the original request.
  findBetween(userA: string, userB: string): Promise<IConnection | null>;
  create(requesterId: string, recipientId: string): Promise<IConnection>;
  findById(connectionId: string): Promise<IConnection | null>;
  updateStatus(connectionId: string, status: ConnectionStatus): Promise<IConnection | null>;
  deleteById(connectionId: string): Promise<void>;
  deleteBetween(userA: string, userB: string): Promise<void>;
  getPendingForUser(userId: string): Promise<IConnection[]>;
  getAcceptedConnections(userId: string): Promise<IConnection[]>;
}