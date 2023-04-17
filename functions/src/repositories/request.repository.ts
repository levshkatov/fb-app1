import {Connections} from "../utils/connections";
import {IPet} from "../models/pet.model";
import {IRequest} from "../models/request.model";
import {SearchService} from "../services/search.service";

export class RequestRepository {

    public static async create(request: any): Promise<IRequest> {
        request._id = (await Connections.dbConnection.collection('requests').add(request)).id;

        return request;
    }

    public static async getByReceiver(profileId: string): Promise<IRequest[]> {
        const requests = await this.getAll();

        return requests.filter(request => request.receiver === profileId);
    }

    public static async getAll(): Promise<IRequest[]> {
        const requests: IRequest[] = [];
        await Connections.dbConnection.collection('requests').get()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    requests.push({_id: doc.id, ...doc.data()})
                });
            });
        return requests;
    }

    public static async delete(requestId: string) {
        await Connections.dbConnection.collection('requests').doc(requestId).delete();
    }

    public static async getById(requestId: string): Promise<IRequest> {
        const request = (await Connections.dbConnection.collection('requests').doc(requestId).get()).data();

        request._id = requestId;

        return request;
    }

}
