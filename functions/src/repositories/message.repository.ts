import {Connections} from "../utils/connections";
import {IConversation} from "../models/conversation.model";
import {IMessage} from "../models/message.model";
import {IProfile} from "../models/profile.model";

export class MessageRepository {

    public static async create(message: any): Promise<IMessage> {
        message._id = (await Connections.dbConnection.collection('messages').add(message)).id;

        return message;
    }

    public static async getByConversationId(conversationId: string): Promise<IMessage[]> {
        const messages: IMessage[] = [];

        await Connections.dbConnection.collection('messages').get()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    if (doc.data().conversationId === conversationId) {
                        messages.push({_id: doc.id, ...doc.data()})
                    }
                });
            });

        return messages;
    }

    public static async update(data: any, messageId: string): Promise<IMessage> {
        await Connections.dbConnection.collection('messages').doc('' + messageId).update(data);

        return {...data, _id: messageId};
    }

    public static async getUnreadMessagesByConversationIdAndTo(conversationId: string, profileId: string): Promise<IMessage[]> {
        const messages: IMessage[] = [];

        await Connections.dbConnection.collection('messages').get()
            .then((snapshot: any) => {
                snapshot.forEach((doc: any) => {
                    if (doc.data().conversationId === conversationId && doc.data().to === profileId && doc.data().isUnread) {
                        messages.push({_id: doc.id, ...doc.data()})
                    }
                });
            });

        return messages;
    }

    public static async deleteByConversationId(conversationId: string) {
        const messages = await this.getByConversationId(conversationId);

        for (const message of messages) {
            await this.delete(message._id)
        }
    }

    private static async delete(messageId: string) {
        await Connections.dbConnection.collection('messages').doc(messageId).delete();
    }

}
