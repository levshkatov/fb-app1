import {Router} from "express";

import {RouterController} from "./router.controller";
import {AuthService} from "../services/auth.service";

export class AdminController implements RouterController {

    public getRouter(): Router {
        return require('express').Router()
            .post(
                '', async (request: any, response: any) => {
                    await AuthService.login(request.body.email, request.body.password)
                        .then((value) =>
                            response.status(200).send({accessToken: value})
                        )
                        .catch((e) => {
                            console.log(e.stack);
                            response.status(500).send(e.message);
                        });
                });
    }

}
