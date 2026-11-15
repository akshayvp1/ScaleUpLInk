import { injectable, inject } from "tsyringe";
import { IConnectionRepository } from "../../repositories/connection/interface/IConnectionRepository";
import { ConnectionStatus } from "../../interfaces/IConnection";

// Thrown as plain Error messages; controller maps them to HTTP status codes.
export const ConnectionErrors = {
  CANNOT_CONNECT_SELF: "CANNOT_CONNECT_SELF",
  REQUEST_ALREADY_PENDING: "REQUEST_ALREADY_PENDING",
  ALREADY_CONNECTED: "ALREADY_CONNECTED",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  ALREADY_RESOLVED: "ALREADY_RESOLVED",
} as const;

@injectable()
class ConnectionService {
  constructor(
    @inject("IConnectionRepository")
    private readonly connectionRepository: IConnectionRepository
  ) {}

  async sendRequest(
    requesterId: string,
    recipientId: string
  ) {
    if (requesterId === recipientId) {
      throw new Error(ConnectionErrors.CANNOT_CONNECT_SELF);
    }

    const existing =
      await this.connectionRepository.findBetween(
        requesterId,
        recipientId
      );

    if (existing) {
      if (existing.status === "pending") {
        throw new Error(
          ConnectionErrors.REQUEST_ALREADY_PENDING
        );
      }

      if (existing.status === "accepted") {
        throw new Error(
          ConnectionErrors.ALREADY_CONNECTED
        );
      }

      // Existing request was rejected.
      // Allow the user to send a new request.
      if (existing.status === "rejected") {
        await this.connectionRepository.deleteById(
          existing._id.toString()
        );
      }
    }

    return await this.connectionRepository.create(
      requesterId,
      recipientId
    );
  }

  async respondToRequest(
    connectionId: string,
    recipientId: string,
    accept: boolean
  ) {
    const connection =
      await this.connectionRepository.findById(
        connectionId
      );

    if (!connection) {
      throw new Error(ConnectionErrors.NOT_FOUND);
    }

    if (
      connection.recipient.toString() !== recipientId
    ) {
      throw new Error(ConnectionErrors.FORBIDDEN);
    }

    if (connection.status !== "pending") {
      throw new Error(
        ConnectionErrors.ALREADY_RESOLVED
      );
    }

    const status: ConnectionStatus = accept
      ? "accepted"
      : "rejected";

    return await this.connectionRepository.updateStatus(
      connectionId,
      status
    );
  }

  async cancelRequest(
    connectionId: string,
    requesterId: string
  ): Promise<void> {
    const connection =
      await this.connectionRepository.findById(
        connectionId
      );

    if (!connection) {
      throw new Error(ConnectionErrors.NOT_FOUND);
    }

    if (
      connection.requester.toString() !== requesterId
    ) {
      throw new Error(ConnectionErrors.FORBIDDEN);
    }

    if (connection.status !== "pending") {
      throw new Error(
        ConnectionErrors.ALREADY_RESOLVED
      );
    }

    await this.connectionRepository.deleteById(
      connectionId
    );
  }

  async removeConnection(
    userId: string,
    otherUserId: string
  ): Promise<void> {
    await this.connectionRepository.deleteBetween(
      userId,
      otherUserId
    );
  }

  async getStatus(
    userId: string,
    otherUserId: string
  ) {
    const connection =
      await this.connectionRepository.findBetween(
        userId,
        otherUserId
      );

    if (!connection) {
      return {
        status: "none" as const,
      };
    }

    return {
      status: connection.status,
      connectionId: connection._id.toString(),
      isRequester:
        connection.requester.toString() === userId,
    };
  }

  async getPendingRequests(userId: string) {
    return await this.connectionRepository.getPendingForUser(
      userId
    );
  }

  async getConnections(userId: string) {
    return await this.connectionRepository.getAcceptedConnections(
      userId
    );
  }

  /**
   * Used to determine whether two users
   * are allowed to chat with each other.
   */
  async areConnected(
    userA: string,
    userB: string
  ): Promise<boolean> {
    const connection =
      await this.connectionRepository.findBetween(
        userA,
        userB
      );

    return connection?.status === "accepted";
  }
}

export default ConnectionService;