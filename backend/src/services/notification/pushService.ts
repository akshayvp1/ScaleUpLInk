import {
  injectable,
  inject,
} from "tsyringe";

import {
  messaging,
} from "../../config/firebaseAdmin";

import type {
  SendResponse,
} from "firebase-admin/messaging";

import DeviceTokenRepository from "../../repositories/notification/deviceTokenRepository";

import {
  IPushService,
  PushPayload,
} from "./interface/IPushService";

@injectable()
class PushService
  implements IPushService
{
  constructor(
    @inject("DeviceTokenRepository")
    private readonly deviceTokenRepository: DeviceTokenRepository
  ) {}

  async sendToUsers(
    userIds: string[],
    payload: PushPayload
  ): Promise<void> {

    if (!userIds.length) {
      return;
    }

    const tokens =
      await this.deviceTokenRepository
        .getTokensForUsers(userIds);

    if (!tokens.length) {
      console.log(
        "No device tokens found for users:",
        userIds
      );

      return;
    }

    console.log(
      `Sending push to ${tokens.length} device(s)`
    );


    const response =
      await messaging.sendEachForMulticast({

        tokens,

        notification: {
          title:
            payload.title,

          body:
            payload.body,
        },

        data:
          Object.fromEntries(
            Object.entries(
              payload.data || {}
            ).map(
              ([key, value]) => [
                key,
                String(value),
              ]
            )
          ),

        webpush: {

          notification: {
            icon:
              "/icon-192.png",

            badge:
              "/icon-192.png",
          },

          // Do NOT force "/".
          // The service worker handles
          // notification clicks.
        },
      });


    console.log(
      "Push result:",
      {
        successCount:
          response.successCount,

        failureCount:
          response.failureCount,
      }
    );


    const staleTokens: string[] =
      response.responses
        .map(
          (
            result: SendResponse,
            index: number
          ) => {

            if (
              !result.success &&
              this.isUnregistered(
                result.error?.code
              )
            ) {
              return tokens[index];
            }

            return null;
          }
        )
        .filter(
          (
            token
          ): token is string =>
            token !== null
        );


    if (
      staleTokens.length
    ) {

      await this.deviceTokenRepository
        .removeMany(
          staleTokens
        );
    }
  }


  private isUnregistered(
    code?: string
  ): boolean {

    return (
      code ===
        "messaging/registration-token-not-registered" ||

      code ===
        "messaging/invalid-registration-token"
    );
  }
}

export default PushService;