import {Connections} from "../utils/connections";
import {IPet} from "../models/pet.model";

export class PetRepository {

    public static async create(data: any): Promise<IPet> {
        data._id = (await Connections.dbConnection.collection('pets').add(data)).id;

        return data;
    }

    public static async getById(id: string): Promise<IPet> {

        const pet = (await Connections.dbConnection.collection('pets').doc(id).get()).data();

        pet._id = id;

        return pet;
    }

    public static async getByProfileId(profileId: string): Promise<IPet[]> {
        const allPets = await this.getAll();

        return allPets.filter(pet => pet.profileId === profileId);
    }

    public static async getAll(): Promise<IPet[]> {
        const res: IPet[] = [];
        await Connections.dbConnection.collection('pets').get()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    res.push({_id: doc.id, ...doc.data()})
                });
            });
        return res;
    }


    public static async update(pet: any, petId: string): Promise<IPet> {

        await Connections.dbConnection.collection('pets').doc(petId).update(pet);

        return {...pet, _id: petId};
    }

    public static async delete(id: any): Promise<void> {
        await Connections.dbConnection.collection('pets').doc(id).delete();
    }

}
