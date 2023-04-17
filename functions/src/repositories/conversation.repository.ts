import {Connections} from "../utils/connections";
import {IConversation, IConversationMember} from '../models/conversation.model';

export class ConversationRepository {

    public static async create(conversation: any): Promise<IConversation> {
        conversation._id = (await Connections.dbConnection.collection('conversations').add(conversation)).id;

        return conversation;
    }

    public static async getByMember(memberId: string): Promise<IConversation[]> {
        const conversations: IConversation[] = [];

        await Connections.dbConnection.collection('conversations').get()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    for (const member of doc.data().members) {
                        if (member.profileId == memberId) {
                            conversations.push({_id: doc.id, ...doc.data()});
                            break;
                        }
                    }
                });
            });

        return conversations;
    }

    public static async delete(id: any): Promise<void> {
        await Connections.dbConnection.collection('conversations').doc(id).delete();
    }
}
