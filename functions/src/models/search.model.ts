import {Gender} from '../enums/gender.enum';

export interface ISearch {
    _id: string;
    radius: number;
    longitude: number;
    latitude: number;
    petAgeFrom: number;
    petAgeTo: number;
    ownerAgeFrom: number;
    ownerAgeTo: number;
    profileGender: Gender;
    profileSearchGender: Gender,
    petSearchGender: Gender,
    dating: boolean;
    walks: boolean;
    myRace: boolean;
    haveCertificates: boolean;
    fromMyType: boolean;
    mating: boolean;
    all: boolean;
    history: string[];
    profileId: string;
    profileAge: number;
    profilePetsAge: SearchPetsAge[];
    myPetId: string;
    myPetAge: number;
    myPetGender: Gender;
    myPetType: string;
    myPetHaveCertificates: boolean;
}

export interface SearchPetsAge {
    petId: string;
    petAge: number;
    petGender: Gender;
    petType: string;
    haveCertificates: boolean;
}
