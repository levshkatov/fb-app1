export interface ConversationDto {
  _id: string;
  profileId: string;
  profileName: string;
  petName?: string;
  petId?: string;
  profileImage: string;
  petImage?: string;
  lastDate: number;
  city: string;
  unreadCount: number;
  lastMessage: string;
  from: string;
}
