
export interface IConversation {
    _id: string;
    members: IConversationMember[];
}

export interface IConversationMember {
    profileId: string;
    petId: string | null;
}
