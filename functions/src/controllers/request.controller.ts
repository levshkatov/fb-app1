import {Router} from "express";

import {RouterController} from "./router.controller";
import {RequestService} from "../services/request.service";
import {SearchService} from "../services/search.service";


export class RequestController implements RouterController {

    public getRouter(): Router {
        return require("express").Router()
            .get('/:profileId', async (request: any, response: any) => {
                const profileId = request.params.profileId;

                await RequestService.getByReceiver(profileId)
                    .then((value) =>
                        response.status(200).send(value)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            })
            .put('/:requestId/accept', async (request: any, response: any) => {
                const requestId = request.params.requestId;

                await RequestService.accept(requestId)
                    .then((value) =>
                        response.status(201).send(value)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            })
            .put('/:requestId/decline', async (request: any, response: any) => {
                const requestId = request.params.requestId;

                await RequestService.delete(requestId)
                    .then(() =>
                        response.status(200).send()
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            })
            .put('/like', async (request: any, response: any) => {
                const {profileId, receiver, receiverPet} = request.body;

                console.log(request.body);

                    await RequestService.create(profileId, receiver, receiverPet)
                    .then((value) =>
                        response.status(201).send(value)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            })
            .put('/unlike', async (request: any, response: any) => {
                const {profileId, receiverPetId} = request.body;

                await SearchService.updateHistory(profileId, receiverPetId)
                    .then((value) =>
                        response.status(201).send(value)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            })
    }
}
