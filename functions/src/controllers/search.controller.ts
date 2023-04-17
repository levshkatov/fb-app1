import {Router} from "express";

import {RouterController} from "./router.controller";
import {SearchService} from "../services/search.service";

export class SearchController implements RouterController {

    public getRouter(): Router {
        return require('express').Router()
            .get('/:profileId', async (request: any, response: any) => {
                const profileId = request.params.profileId;

                await SearchService.getByProfileId(profileId)
                    .then((value) =>
                        response.status(200).send(value)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            })
          .get('/:searchId/reset', async (request: any, response: any) => {
              const searchId = request.params.searchId;

              await SearchService.reset(searchId)
                .then(() =>
                  response.status(200).send()
                )
                .catch((e) => {
                    console.log(e.stack);
                    response.status(500).send(e.message);
                });
          })
            .get('/:profileId/cards', async (request: any, response: any) => {
                const profileId = request.params.profileId;

                await SearchService.doSearch(profileId)
                    .then((value) =>
                        response.status(200).send(value)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            })
            .put('', async (request: any, response: any) => {
                const search = request.body;
                await SearchService.update(search)
                    .then((value) =>
                        response.status(200).send(value)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    });
            });
    }

}
