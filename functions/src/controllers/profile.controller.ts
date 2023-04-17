import {Router} from "express";

import {RouterController} from "./router.controller";
import {ProfileService} from "../services/profile.service";
import {PetService} from "../services/pet.service";

const Busboy = require('busboy');

export class ProfileController implements RouterController {

    public getRouter(): Router {
        return require('express').Router()
            .post(
                '', (request: any, response: any) => {

                    const busboy = new Busboy({headers: request.headers});

                    const fields: any = {};

                    // This code will process each non-file field in the form.
                    busboy.on('field', (fieldname: any, val: any) => {
                        fields[fieldname] = val;
                    });

                    const fileWrites: any = [];
                    let extension = '';
                    let contentType = 'image/png';

                    // This code will process each file uploaded.
                    busboy.on('file', async (fieldname: any, file: any, filename: string, transferEncoding: string, mimeType: string) => {

                        let buffer: any[] = [];
                        extension = filename.match('.[^.]+$') !== null ? filename.match('.[^.]+$')![0] : '';

                        const promise = new Promise((resolve, reject) => {
                                file.on('data', function (d: any) {
                                    buffer.push(d);
                                });
                                file.on('end', function () {
                                    resolve(Buffer.concat(buffer));
                                });
                            }
                        );

                        fileWrites.push(promise);
                        contentType = mimeType;
                    });

                    busboy.on('finish', async () => {
                        const files = await Promise.all(fileWrites);

                        const profile = await ProfileService.create(fields, files[0], extension, contentType).catch(error => {
                            console.log(error.stack);
                            response.status(500).send(error.message);
                        });

                        response.send(profile);
                    });

                    busboy.end(request.rawBody);
                })
            .put(
                '', async (request: any, response: any) => {

                    const busboy = new Busboy({headers: request.headers});

                    const fields: any = {};

                    // This code will process each non-file field in the form.
                    busboy.on('field', (fieldname: any, val: any) => {
                        fields[fieldname] = val;
                    });

                    const fileWrites: any = [];
                    let extension = '';
                    let contentType = 'image/png';

                    // This code will process each file uploaded.
                    busboy.on('file', async (fieldname: any, file: any, filename: string, transferEncoding: string, mimeType: string) => {

                        let buffer: any[] = [];
                        extension = filename.match('.[^.]+$') !== null ? filename.match('.[^.]+$')![0] : '';

                        const promise = new Promise((resolve, reject) => {
                                file.on('data', function (d: any) {
                                    buffer.push(d);
                                });
                                file.on('end', function () {
                                    resolve(Buffer.concat(buffer));
                                });
                            }
                        );

                        fileWrites.push(promise);
                        contentType = mimeType;
                    });

                    busboy.on('finish', async () => {
                        const files = await Promise.all(fileWrites);

                        const profile = await ProfileService.update(fields, files[0], extension, contentType).catch(error => {
                            console.log(error.stack);
                            response.status(500).send(error.message);
                        });

                        response.send(profile);
                    });

                    busboy.end(request.rawBody);
                })
            .post('/create/:count', async (request: any, response: any) => {

                const count: any = (request.params.count || 1) > 50 ? 50 : (request.params.count || 1);

                try {

                    const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

                    for (let i = 1; i <= count; i++) {

                        const profile = {
                            image: "*",
                            name: `Test Profile ${i}`,
                            lastName: "",
                            age: random([15, 25, 35, 45, 55]),
                            gender: random(["MAN", "WOMAN"]),
                            country: null,
                            city: random(["Moscow", "London", "Madrid", "Rome"]),
                            phoneNumber: "+799999999999",
                            uid: null,
                            requestLeft: 30
                        };

                        const newProfile = await ProfileService.create(profile, null, "", "");

                        const petType: string = random(["dog", "cat"]);

                        const images: { [key: string]: string[]; } = {
                            dog: [],
                            cat: [],
                        };

                        const pet = {
                            image: random(images[petType]),
                            name: `Test Pet ${i}`,
                            perType: petType,
                            age: random([2, 4, 6, 8, 10]),
                            gender: random(["MAN", "WOMAN"]),
                            profileId: newProfile._id,
                            certificates: [],
                            vaccines: [],
                            photos: []
                        };

                        await PetService.create(pet, null, "", "");

                    }

                    response.status(200).send("Done");

                } catch (e) {
                    console.log(e.stack);
                    response.status(500).send(e.message);
                }
            })
            .get('/:id', async (request: any, response: any) => {
                const id = request.params.id;
                await ProfileService.getById(id)
                    .then((profile) =>
                        response.status(200).send(profile)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    })
            })
            .get('/uid/:uid', async (request: any, response: any) => {
                const uid = request.params.uid;
                await ProfileService.getByUid(uid)
                    .then((profile) =>
                        response.status(200).send(profile)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    })
            })
            .get('', async (request: any, response: any) => {
                await ProfileService.getAll()
                    .then((profile) =>
                        response.status(200).send(profile)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    })
            })
            .delete('/:id', async (request: any, response: any) => {
                const id = request.params.id;
                await ProfileService.delete(id)
                    .then(() =>
                        response.status(200).send()
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    })
            })
    }

}
