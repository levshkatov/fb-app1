import {Connections} from "../utils/connections";
import {ISearch, SearchPetsAge} from "../models/search.model";
import {Gender} from '../enums/gender.enum';

export class SearchRepository {

    public static async create(search: any): Promise<ISearch> {
        search._id = (await Connections.dbConnection.collection('search').add(search)).id;

        return search;
    }

    public static async getByProfileId(profileId: string): Promise<ISearch | null> {
        let search = null;

        await Connections.dbConnection.collection('search').get()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    if (doc.data().profileId == profileId) {
                        search = {_id: doc.id, ...doc.data()}
                    }
                });
            });

        return search;
    }

    public static async getById(id: string): Promise<ISearch> {
        const search = (await Connections.dbConnection.collection('search').doc(id).get()).data();

        search._id = id;

        return search;
    }

    // public static async search(search: ISearch): Promise<any[]> {
    //     const result: any[] = [];

    //     await Connections.dbConnection.collection('search').get()
    //         .then((snapshot: any) => {
    //             snapshot.forEach((doc: any) => {
    //                 if (search.ownerAgeFrom <= doc.data().profileAge && search.ownerAgeTo >= doc.data().profileAge
    //                     && ((search.myRace == doc.data().myRace && search.dating == doc.data().dating && search.walks == doc.data().walks) || search.all)
    //                     && (search.profileSearchGender == doc.data().profileGender || search.profileSearchGender == Gender.ALL)) {

    //                     doc.data().profilePetsAge.forEach((profilePetAge: SearchPetsAge) => {
    //                         if (!search.history.includes(profilePetAge.petId) && search.petAgeFrom <= profilePetAge.petAge && search.petAgeTo >= profilePetAge.petAge
    //                             && (search.petSearchGender == profilePetAge.petGender || search.petSearchGender == Gender.ALL)) {
    //                             result.push({petId: profilePetAge.petId, longitude: doc.data().longitude, latitude: doc.data().latitude});
    //                         }
    //                     });
    //                 }
    //             });
    //         });

    //     return result;
    // }

    public static async search(search: ISearch): Promise<any[]> {
        const result: any[] = [];

        console.log(search);

        let query = Connections.dbConnection.collection('search');

        query = query.where('profileAge', '>=', search.ownerAgeFrom).where('profileAge', '<=', search.ownerAgeTo);

        // if (!search.all) {
        //     query = query.where('mating', '==', search.mating);
        // }

        if (search.profileSearchGender !== Gender.ALL) {
            query = query.where('profileGender', '==', search.profileSearchGender);
        }

        if (search.petSearchGender !== Gender.ALL) {
            query = query.where('myPetGender', '==', search.petSearchGender);
        }

        // if (search.fromMyType) {
        //     query = query.where('myPetType', '==', search.myPetType);
        // }

        // if (search.haveCertificates) {
        //     query = query.where('myPetHaveCertificates', '==', true);
        // }

        let searches = await query.get();

        searches.forEach((_search: any) => { 
            const data = _search.data();

            if ((search.all 
                || (search.haveCertificates == data.haveCertificates 
                    && search.mating == data.mating 
                    && search.walks == data.walks)) 
                || (search.fromMyType 
                    && search.myPetType == data.myPetType)) {

                        if (data.myPetAge >= search.petAgeFrom 
                            && data.myPetAge <= search.petAgeTo 
                            && !search.history.includes(data.myPetId)
                            && search.profileId !== data.profileId) {

                                result.push({
                                    petId: data.myPetId, 
                                    profileId: data.profileId, 
                                    longitude: data.longitude, 
                                    latitude: data.latitude,
                                });
                        }
                    }
        });

        console.log(result);

        return result;
    }


    public static async update(search: ISearch): Promise<ISearch> {
        const data = {
            radius: search.radius,
            longitude: search.longitude,
            latitude: search.latitude,
            petAgeFrom: search.petAgeFrom,
            petAgeTo: search.petAgeTo,
            history: search.history,
            ownerAgeFrom: search.ownerAgeFrom,
            ownerAgeTo: search.ownerAgeTo,
            dating: search.dating,
            walks: search.walks,
            myRace: search.myRace,
            haveCertificates: search.haveCertificates,
            fromMyType: search.fromMyType,
            mating: search.mating,
            all: search.all,
            profileId: search.profileId,
            profileAge: +search.profileAge,
            profilePetsAge: search.profilePetsAge,
            profileGender: search.profileGender,
            profileSearchGender: search.profileSearchGender,
            petSearchGender: search.petSearchGender,
            myPetId: search.profilePetsAge[0].petId,
            myPetAge: +search.profilePetsAge[0].petAge,
            myPetGender: search.profilePetsAge[0].petGender,
            // myPetType: search.profilePetsAge[0].petType,
            // myPetHaveCertificates: search.profilePetsAge[0].haveCertificates,
        };

        await Connections.dbConnection.collection('search').doc(search._id).update(data);

        return search;
    }

    public static async delete(id: string) {
        await Connections.dbConnection.collection('search').doc(id).delete();
    }

}
