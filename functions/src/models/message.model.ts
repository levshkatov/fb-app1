
export interface IMessage {
    _id: string;
    from: string;
    to: string;
    text: string;
    createdAt: number;
    isUnread: boolean;
    conversationId: string;
}
