import {IPet} from "../models/pet.model";
import {PetRepository} from "../repositories/pet.repository";
import {FileService} from "./file.service";
import {SearchService} from "./search.service";

export class PetService {

    public static async create(pet: any, image: any, extension: string, contentType: string): Promise<IPet> {
        let httpsReference = await FileService.getImageLink(image, extension, contentType);

        const data = {
            image: pet.image || httpsReference,
            name: pet.name,
            perType: pet.perType,
            age: +pet.age,
            gender: pet.gender,
            profileId: pet.profileId,
            certificates: [],
            vaccines: [],
            photos: []
        };

        const newPet = await PetRepository.create(data);

        SearchService.addPet({
            petId: newPet._id, 
            petAge: +newPet.age, 
            petGender: newPet.gender, 
            haveCertificates: newPet.certificates.length > 0,
            petType: newPet.perType,
        }, newPet.profileId);

        return newPet;
    }

    public static async getById(id: string): Promise<IPet> {
        return await PetRepository.getById(id);
    }

    public static async getByProfileId(profileId: string): Promise<IPet[]> {
        return await PetRepository.getByProfileId(profileId)
    }

    public static async getAll(): Promise<IPet[] | null> {
        return await PetRepository.getAll();
    }

    public static async update(pet: IPet, image: any, extension: string, contentType: string): Promise<IPet> {
        const httpsReference = await FileService.getImageLink(image, extension, contentType);
        const oldPet = await this.getById(pet._id);

        const data = {
            image: pet.image,
            name: pet.name,
            perType: pet.perType,
            age: +pet.age,
            gender: pet.gender,
            profileId: pet.profileId,
            certificates: oldPet.certificates,
            vaccines: oldPet.vaccines,
            photos: oldPet.photos
        };

        if (httpsReference) {
            data.image = httpsReference;
        }

        const updatedPet = await PetRepository.update(data, pet._id);

        SearchService.updateByPet(updatedPet!);

        return updatedPet;
    }

    public static async loadFile(id: string, type: string, file: any, extension: string, vaccineType: string, contentType: string): Promise<IPet> {
        if (!file) {
            throw new Error('File is empty...');
        }

        const pet = await this.getById(id);

        const fileReference = await FileService.getImageLink(file, extension, contentType);

        switch (type) {
            case 'CERTIFICATE': {
                pet.certificates = pet.certificates ? pet.certificates : [];
                pet.certificates.push({link: fileReference!, name: extension, createdAt: Date.now()});
                break;
            }
            case 'VACCINE': {
                pet.vaccines = pet.vaccines ? pet.vaccines : [];
                pet.vaccines.push({link: fileReference!, name: extension, vaccineType: vaccineType, createdAt: Date.now()});
                break;
            }
            case 'PHOTO': {
                pet.photos = pet.photos ? pet.photos : [];
                pet.photos.push(fileReference!);
                break;
            }
            default: {
                throw new Error('Unsupported type...');
            }
        }

        return await this.updateWithFiles(pet, null, '');
    }

    public static async deleteFile(id: string, type: string, link: string): Promise<void> {
        const pet = await this.getById(id);

        switch (type) {
            case 'CERTIFICATE': {
                pet.certificates = pet.certificates.filter(cert => cert.link !== link);
                break;
            }
            case 'VACCINE': {
                pet.vaccines = pet.vaccines.filter(cert => cert.link !== link);
                break;
            }
            case 'PHOTO': {
                pet.photos = pet.photos.filter(photoLink => photoLink !== link);
                break;
            }
            default: {
                throw new Error('Unsupported type...');
            }
        }

        await this.updateWithFiles(pet, null, '');
    }

    public static async updateWithFiles(pet: IPet, image: any, extension: string): Promise<IPet> {
        const data = {
            image: pet.image,
            name: pet.name,
            perType: pet.perType,
            age: +pet.age,
            gender: pet.gender,
            profileId: pet.profileId,
            certificates: pet.certificates,
            vaccines: pet.vaccines,
            photos: pet.photos
        };

        const updatedPet = await PetRepository.update(data, pet._id);

        SearchService.updateByPet(updatedPet!);

        return updatedPet;
    }

    public static async delete(id: string): Promise<void> {
        const pet = await this.getById(id);

        await PetRepository.delete(id);

        SearchService.deletePet(pet._id, pet.profileId);
    }

}
