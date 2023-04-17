import {Router} from "express";

import {RouterController} from "./router.controller";
import {PetService} from "../services/pet.service";

const Busboy = require('busboy');

export class PetController implements RouterController {

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

                        const pet = await PetService.create(fields, files[0], extension, contentType).catch(error => {
                            console.log(error.stack);
                            response.status(500).send(error.message);
                        });

                        response.send(pet);
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

                        const profile = await PetService.update(fields, files[0], extension, contentType).catch(error => {
                            console.log(error.stack);
                            response.status(500).send(error.message);
                        });

                        response.send(profile);
                    });

                    busboy.end(request.rawBody);
                })
            .get('/:id', async (request: any, response: any) => {
                const id = request.params.id;
                await PetService.getById(id)
                    .then((profile) =>
                        response.status(200).send(profile)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    })
            })
            .get('', async (request: any, response: any) => {
                await PetService.getAll()
                    .then((profile) =>
                        response.status(200).send(profile)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    })
            })
            .get('/users/:id', async (req: any, res: any) => {
                await PetService.getByProfileId(req.params.id)
                    .then((profile) =>
                        res.status(200).send(profile)
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        res.status(500).send(e.message);
                    })
            })
            .delete('/:id', async (request: any, response: any) => {
                const id = request.params.id;
                await PetService.delete(id)
                    .then(() =>
                        response.status(200).send()
                    )
                    .catch((e) => {
                        console.log(e.stack);
                        response.status(500).send(e.message);
                    })
            })
            .put('/:id/files/:type/delete', async (request: any, response: any) => {
              const id = request.params.id;
              const type = request.params.type;
              const link = request.body.link;
              await PetService.deleteFile(id, type, link)
                .then(() =>
                  response.status(200).send()
                )
                .catch((e) => {
                  console.log(e.stack);
                  response.status(500).send(e.message);
                })
            })
            .put('/:petId/files/:type', async (request: any, response: any) => {
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
                extension = filename;

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

                const file = await PetService.loadFile(request.params.petId, request.params.type, files[0], extension, fields['vaccineType'], contentType).catch(error => {
                  console.log(error.stack);
                  response.status(500).send(error.message);
                });

                response.send(file);
              });

              busboy.end(request.rawBody);
            });
    }

}
