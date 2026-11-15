import {
  Request,
  Response,
} from "express";

import {
  injectable,
  inject,
} from "tsyringe";

import ConnectionService from "../../services/connection/connectionService";

import NotificationService from "../../services/notification/notificationService";

import { ITokenPayload } from "../../utils/jwt";

const ERROR_STATUS: Record<
  string,
  number
> = {
  CANNOT_CONNECT_SELF: 400,
  REQUEST_ALREADY_PENDING: 409,
  ALREADY_CONNECTED: 409,
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  ALREADY_RESOLVED: 409,
};

type AuthenticatedRequest =
  Request & {
    user?: ITokenPayload;
  };

@injectable()
class ConnectionController {
  constructor(
    @inject("ConnectionService")
    private readonly connectionService: ConnectionService,

    @inject("NotificationService")
    private readonly notificationService: NotificationService
  ) {}

  // ============================================================
  // SEND REQUEST
  // ============================================================

  async sendRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const {
        userId: recipientId,
      } = req.body;

      const requesterId =
        req.user?.id;

      if (!requesterId) {
        res.status(401).json({
          message:
            "User not authenticated",
        });
        return;
      }

      if (
        typeof recipientId !==
          "string" ||
        !recipientId.trim()
      ) {
        res.status(400).json({
          message:
            "userId is required",
        });
        return;
      }

      const connection =
        await this.connectionService.sendRequest(
          requesterId,
          recipientId
        );

      // Push notification to recipient
      this.notificationService
        .notifyConnectionRequest(
          requesterId,
          recipientId,
          String(connection._id)
        )
        .catch((err) => {
          console.error(
            "notifyConnectionRequest failed:",
            err
          );
        });

      res.status(201).json({
        message:
          "Connection request sent",

        data: connection,
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "sendRequest error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while sending the connection request",
        });
    }
  }

  // ============================================================
  // ACCEPT / IGNORE REQUEST
  // ============================================================

  async respondToRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const connectionId =
        req.params.connectionId;

      const recipientId =
        req.user?.id;

      const { accept } =
        req.body as {
          accept?: unknown;
        };

      if (!recipientId) {
        res.status(401).json({
          message:
            "User not authenticated",
        });
        return;
      }

      if (
        typeof connectionId !==
          "string" ||
        !connectionId.trim()
      ) {
        res.status(400).json({
          message:
            "Invalid connectionId",
        });
        return;
      }

      if (
        typeof accept !==
        "boolean"
      ) {
        res.status(400).json({
          message:
            "accept must be a boolean",
        });
        return;
      }

      const connection =
        await this.connectionService.respondToRequest(
          connectionId,
          recipientId,
          accept
        );

      if (!connection) {
        res.status(404).json({
          message:
            "Connection not found",
        });
        return;
      }

      // ----------------------------------------
      // ACCEPTED
      // ----------------------------------------

      if (accept) {
        const requesterId =
          typeof connection.requester ===
          "object"
            ? String(
                connection.requester._id
              )
            : String(
                connection.requester
              );

        // Notify original requester
        this.notificationService
          .notifyConnectionAccepted(
            recipientId,
            requesterId,
            String(connection._id)
          )
          .catch((err) => {
            console.error(
              "notifyConnectionAccepted failed:",
              err
            );
          });
      }

      res.status(200).json({
        message: accept
          ? "Connection request accepted"
          : "Connection request ignored",

        data: connection,
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "respondToRequest error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while responding to the connection request",
        });
    }
  }

  // ============================================================
  // CANCEL REQUEST
  // ============================================================

  async cancelRequest(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const connectionId =
        req.params.connectionId;

      const requesterId =
        req.user?.id;

      if (!requesterId) {
        res.status(401).json({
          message:
            "User not authenticated",
        });
        return;
      }

      if (
        typeof connectionId !==
          "string" ||
        !connectionId.trim()
      ) {
        res.status(400).json({
          message:
            "Invalid connectionId",
        });
        return;
      }

      await this.connectionService.cancelRequest(
        connectionId,
        requesterId
      );

      res.status(200).json({
        message:
          "Connection request cancelled",
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "cancelRequest error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while cancelling the request",
        });
    }
  }

  // ============================================================
  // REMOVE CONNECTION
  // ============================================================

  async removeConnection(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const otherUserId =
        req.params.userId;

      const userId =
        req.user?.id;

      if (!userId) {
        res.status(401).json({
          message:
            "User not authenticated",
        });
        return;
      }

      if (
        typeof otherUserId !==
          "string" ||
        !otherUserId.trim()
      ) {
        res.status(400).json({
          message:
            "userId is required",
        });
        return;
      }

      await this.connectionService.removeConnection(
        userId,
        otherUserId
      );

      res.status(200).json({
        message:
          "Connection removed",
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "removeConnection error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while removing the connection",
        });
    }
  }

  // ============================================================
  // CONNECTION STATUS
  // ============================================================

  async getStatus(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const otherUserId =
        req.params.userId;

      const userId =
        req.user?.id;

      if (!userId) {
        res.status(401).json({
          message:
            "User not authenticated",
        });
        return;
      }

      if (
        typeof otherUserId !==
          "string" ||
        !otherUserId.trim()
      ) {
        res.status(400).json({
          message:
            "userId is required",
        });
        return;
      }

      const status =
        await this.connectionService.getStatus(
          userId,
          otherUserId
        );

      res.status(200).json({
        data: status,
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "getStatus error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while fetching connection status",
        });
    }
  }

  // ============================================================
  // PENDING REQUESTS
  // ============================================================

  async getPendingRequests(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId =
        req.user?.id;

      if (!userId) {
        res.status(401).json({
          message:
            "User not authenticated",
        });
        return;
      }

      const requests =
        await this.connectionService.getPendingRequests(
          userId
        );

      res.status(200).json({
        data: requests,
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "getPendingRequests error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while fetching pending requests",
        });
    }
  }

  // ============================================================
  // CONNECTIONS FOR USER
  // ============================================================

  async getConnectionsForUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId =
        req.params.userId;

      if (
        typeof userId !==
          "string" ||
        !userId.trim()
      ) {
        res.status(400).json({
          message:
            "userId is required",
        });
        return;
      }

      const connections =
        await this.connectionService.getConnections(
          userId
        );

      res.status(200).json({
        data: connections,
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "getConnectionsForUser error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while fetching connections",
        });
    }
  }

  // ============================================================
  // MY CONNECTIONS
  // ============================================================

  async getConnections(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId =
        req.user?.id;

      if (!userId) {
        res.status(401).json({
          message:
            "User not authenticated",
        });
        return;
      }

      const connections =
        await this.connectionService.getConnections(
          userId
        );

      res.status(200).json({
        data: connections,
      });
    } catch (error) {
      const messageKey =
        error instanceof Error
          ? error.message
          : "";

      console.error(
        "getConnections error:",
        error
      );

      res
        .status(
          ERROR_STATUS[messageKey] ||
            500
        )
        .json({
          message:
            messageKey ||
            "An error occurred while fetching connections",
        });
    }
  }
}

export default ConnectionController;