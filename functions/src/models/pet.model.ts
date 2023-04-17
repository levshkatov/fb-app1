import {Gender} from '../enums/gender.enum';

export interface IPet {
    _id: string;
    image: string;
    name: string;
    perType: string;
    age: number;
    gender: Gender;
    profileId: string;
    certificates: any[];
    vaccines: any[];
    photos: string[];
}
