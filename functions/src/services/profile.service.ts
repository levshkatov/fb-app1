import {IProfile} from "../models/profile.model";
import {ProfileRepository} from "../repositories/profile.repository";
import {PetService} from "./pet.service";
import {FileService} from "./file.service";
import {SearchService} from "./search.service";

export class ProfileService {

    public static async create(profile: any, image: any, extension: string, contentType: string): Promise<IProfile> {
        let httpsReference = await FileService.getImageLink(image, extension, contentType);

        const data = {
            image: profile.image || httpsReference,
            name: profile.name,
            lastName: profile.lastName,
            age: +profile.age,
            gender: profile.gender,
            country: null,
            city: profile.city,
            phoneNumber: profile.phoneNumber,
            uid: profile.uid ? profile.uid : null,
            requestLeft: 30
        };

        const newProfile = await ProfileRepository.create(data);

        SearchService.getByProfileId(newProfile._id);

        return newProfile;
    }

    public static async getById(id: string): Promise<IProfile | null> {
        const profile: any = await ProfileRepository.getById(id);
        if (!profile) {
            return null;
        }

        profile.pets = await PetService.getByProfileId(profile._id);

        return profile;
    }

    public static async getByUid(uid: string): Promise<IProfile | null> {
        const profile: any = await ProfileRepository.getByUid(uid);

        if (profile) {
            profile.pets = await PetService.getByProfileId(profile._id);
        }

        return profile;
    }

    public static async getAll(): Promise<IProfile[] | null> {
        return await ProfileRepository.getAll();
    }

    public static async update(profile: IProfile, image: any, extension: string, contentType: string): Promise<IProfile | null> {

        let httpsReference = await FileService.getImageLink(image, extension, contentType);

        const oldProfile = await this.getById(profile._id);

        const data = {
            image: profile.image || oldProfile?.image,
            name: profile.name,
            lastName: profile.lastName,
            phoneNumber: profile.phoneNumber,
            age: +profile.age,
            gender: profile.gender,
            country: null,
            city: profile.city,
            requestLeft: oldProfile?.requestLeft
        };

        if (httpsReference) {
            data.image = httpsReference;
        }

        const updatedProfile = await ProfileRepository.update(data, profile._id);

        SearchService.updateByProfile(updatedProfile!);

        return updatedProfile;
    }

    public static async delete(id: string): Promise<void> {
        const pets = await PetService.getByProfileId(id);
        for (const pet of pets) {
            await PetService.delete(pet._id);
        }

        const search = await SearchService.getByProfileId(id);
        await SearchService.delete(search._id);

        await ProfileRepository.delete(id);
    }

}
