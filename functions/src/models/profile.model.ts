import {Gender} from '../enums/gender.enum';

export interface IProfile {
    _id: string;
    image: string;
    name: string;
    lastName: number;
    phoneNumber: string;
    age: number;
    gender: Gender;
    country: string;
    city: string;
    requestLeft: number;
    uid: string;
}
