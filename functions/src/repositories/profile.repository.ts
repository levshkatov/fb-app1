import {Connections} from "../utils/connections";
import {IProfile} from "../models/profile.model";

export class ProfileRepository {

    public static async create(data: any): Promise<IProfile> {
        data._id = (await Connections.dbConnection.collection('profiles').add(data)).id;

        return data;
    }

    public static async getById(id: string): Promise<IProfile | null> {
        const profile = (await Connections.dbConnection.collection('profiles').doc(id).get()).data();
        if (!profile) {
            return null;
        }

        profile._id = id;

        return profile;
    }

    public static async getByUid(uid: string): Promise<IProfile | null> {
        let profile = null;

        await Connections.dbConnection.collection('profiles').get()
          .then((snapshot: any) => {
              snapshot.forEach((doc: any) => {
                  if (doc.data().uid == uid) {
                      profile = {_id: doc.id, ...doc.data()};
                  }
              });
          });

        return profile ? profile : null;
    }

    public static async getAll(): Promise<IProfile[]> {
        const res: IProfile[] = [];
        await Connections.dbConnection.collection('profiles').get()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    res.push({_id: doc.id, ...doc.data()})
                });
            });
        return res;
    }


    public static async update(profile: any, profileId: string): Promise<IProfile> {

        await Connections.dbConnection.collection('profiles').doc('' + profileId).update(profile);

        return {...profile, _id: profileId};
    }

    public static async delete(id: any): Promise<void> {
        await Connections.dbConnection.collection('profiles').doc(id).delete();
    }

}
