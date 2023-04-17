import {Router} from "express";

import {RouterController} from "./router.controller";
import {ConversationService} from "../services/conversation.service";


export class ConversationController implements RouterController {

  public getRouter(): Router {
    return require("express").Router()
      .get('/profiles/:profileId', async (request: any, response: any) => {
        const profileId = request.params.profileId;

        await ConversationService.getByMember(profileId)
          .then((value) =>
            response.status(200).send(value)
          )
          .catch((e) => {
            console.log(e.stack);
            response.status(500).send(e.message);
          });
      })
      .get('/:conversationId/messages/:profileId', async (request: any, response: any) => {
        const conversationId = request.params.conversationId;
        const profileId = request.params.profileId;

        await ConversationService.getMessagesByConversationForUser(conversationId, profileId)
          .then((value) =>
            response.status(200).send(value)
          )
          .catch((e) => {
            console.log(e.stack);
            response.status(500).send(e.message);
          });
      })
      .put('/:conversationId/messages', async (request: any, response: any) => {
        const message = request.body;
        const conversationId = request.params.conversationId;

        await ConversationService.sendMessage(message, conversationId)
          .then((value) =>
            response.status(200).send(value)
          )
          .catch((e) => {
            console.log(e.stack);
            response.status(500).send(e.message);
          });
      })
      .put('/:conversationId/delete', async (request: any, response: any) => {
        const conversationId = request.params.conversationId;

        await ConversationService.delete(conversationId)
          .then(() =>
            response.status(200).send()
          )
          .catch((e) => {
            console.log(e.stack);
            response.status(500).send(e.message);
          });
      })
      .put('/:conversationId/messages/:profileId/unread', async (request: any, response: any) => {
        const conversationId = request.params.conversationId;
        const profileId = request.params.profileId;

        await ConversationService.unreadMessages(conversationId, profileId)
          .then(() =>
            response.status(200).send()
          )
          .catch((e) => {
            console.log(e.stack);
            response.status(500).send(e.message);
          });
      });
  }
}
