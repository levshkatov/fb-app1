import {SearchRepository} from "../repositories/search.repository";
import {ISearch, SearchPetsAge} from "../models/search.model";
import {ProfileService} from "./profile.service";
import {PetService} from "./pet.service";
import {SearchDto} from "./dto/search.dto";
import {IProfile} from "../models/profile.model";
import {IPet} from "../models/pet.model";
import {IRequest} from "../models/request.model";
import {Gender} from '../enums/gender.enum';
import {RequestService} from './request.service';
import {ConversationService} from './conversation.service';

export class SearchService {

  public static async create(profileId: string): Promise<ISearch> {
    const profile = await ProfileService.getById(profileId);
    const pets = await PetService.getByProfileId(profileId);
    const searchPetsAge: SearchPetsAge[] = [];

    pets.forEach(pet => {
      searchPetsAge.push({
        petId: pet._id, 
        petAge: +pet.age, 
        petGender: pet.gender,
        petType: pet.perType,
        haveCertificates: pet.certificates.length > 0
      });
    });

    const search: any = {
      radius: -1,
      longitude: -1,
      latitude: -1,
      petAgeFrom: 0,
      petAgeTo: 30,
      ownerAgeFrom: 1,
      ownerAgeTo: 100,
      profileGender: profile?.gender,
      dating: false,
      walks: false,
      myRace: false,
      haveCertificates: false,
      fromMyType: false,
      mating: false,
      all: true,
      profileSearchGender: Gender.ALL,
      petSearchGender: Gender.ALL,
      profileId: profileId,
      profileAge: +profile!.age,
      profilePetsAge: searchPetsAge,
      history: [],
      myPetId: searchPetsAge[0].petId,
      myPetAge: +searchPetsAge[0].petAge,
      myPetGender: searchPetsAge[0].petGender,
      myPetType: searchPetsAge[0].petType,
      myPetHaveCertificates: searchPetsAge[0].haveCertificates,
    };

    return await SearchRepository.create(search);
  }

  public static async getByProfileId(profileId: string): Promise<ISearch> {
    let search: any = await SearchRepository.getByProfileId(profileId);

    if (!search) {
      search = await this.create(profileId);
    }

    return search!;
  }

  public static async reset(searchId: string) {
    const search = await this.getById(searchId);

    search.history = [];

    await SearchRepository.update(search);

    await RequestService.reset(search.profileId);
    await ConversationService.reset(search.profileId);
  }

  public static async update(search: ISearch): Promise<ISearch> {
    const oldSearch = await this.getById(search._id);

    search.history = oldSearch.history;

    return await SearchRepository.update(search);
  }

  public static async getById(id: string): Promise<ISearch> {
    return await SearchRepository.getById(id);
  }

  public static async doSearch(profileId: string): Promise<SearchDto[]> {
    const search = await this.getByProfileId(profileId);

    // const petIds = (await SearchRepository.search(search)).filter(searchTemp => !search.profilePetsAge.some(pet => pet.petId == searchTemp.petId));
    const petIds = await SearchRepository.search(search);

    let searchDtos: SearchDto[] = [];

    for (let petId of petIds) {
      const pet = await PetService.getById(petId.petId);
      const profile = await ProfileService.getById(pet.profileId);

      searchDtos.push({
        profileId: pet.profileId,
        petId: petId.petId,
        age: +pet.age,
        perType: pet.perType,
        imageProfile: profile!.image,
        imagePet: pet.image,
        profileName: `${profile!.name} ${profile!.lastName}`,
        petName: pet.name,
        petGender: pet.gender,
        city: profile!.city,
        petPhotos: pet.photos,
        distance: this.getDistanceFromLatLonInKm(search.latitude, search.longitude, petId.latitude, petId.longitude),
        certificateCount: pet.certificates.length
      });
    }

    if (search.radius > 0) {
      searchDtos = searchDtos.filter(el => (+el.distance / 1000) <= search.radius);
    }

    console.log(searchDtos);

    return searchDtos;
  }

  public static async updateByProfile(profile: IProfile) {
    const search = await this.getByProfileId(profile._id);

    search.profileAge = profile.age;
    search.profileGender = profile.gender;

    this.update(search);
  }

  public static async updateByPet(pet: IPet) {
    const search = await this.getByProfileId(pet.profileId);

    search.profilePetsAge.forEach(tempPet => {
      if (tempPet.petId === pet._id) {
        tempPet.petAge = pet.age;
        tempPet.petGender = pet.gender;
        tempPet.petType = pet.perType;
        tempPet.haveCertificates = pet.certificates.length > 0;
      }
    });

    search.myPetAge = search.profilePetsAge[0].petAge;
    search.myPetGender = search.profilePetsAge[0].petGender;
    search.myPetType = search.profilePetsAge[0].petType;
    search.myPetHaveCertificates = search.profilePetsAge[0].haveCertificates;

    this.update(search);
  }

  public static async updateByRequest(request: IRequest) {
    this.updateHistory(request.profileId, request.receiverPet);
    // this.updateHistory(request.receiver, request.profileId);
  }

  public static async updateHistory(profileId: string, historyId: string) {
    const search = await this.getByProfileId(profileId);

    search.history.push(historyId);

    return await SearchRepository.update(search)
  }

  public static async addPet(petAge: SearchPetsAge, profileId: string) {
    const search = await this.getByProfileId(profileId);
    search.profilePetsAge.push(petAge);

    search.myPetId = petAge.petId;
    search.myPetAge = petAge.petAge;
    search.myPetGender = petAge.petGender;
    search.myPetType = petAge.petType;
    search.myPetHaveCertificates = petAge.haveCertificates;

    await this.update(search);
  }

  public static async deletePet(petId: string, profileId: string) {
    const search = await this.getByProfileId(profileId);
    search.profilePetsAge = search.profilePetsAge.filter(petAge => petAge.petId !== petId);

    await this.update(search);
  }

  public static async delete(id: string) {
    await SearchRepository.delete(id);
  }

  public static getDistanceFromLatLonInKm(lat1: number,lon1: number,lat2: number,lon2: number): string {
    if (!lat1 || !lat2 || !lon1 || !lon2) {
      return "";
    }

    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2-lat1);  // deg2rad below
    const dLon = this.deg2rad(lon2-lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return (d * 1000).toFixed(0).toString();
  }

  public static deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }

}
