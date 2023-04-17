import {IConversation, IConversationMember} from '../models/conversation.model';
import {ConversationRepository} from "../repositories/conversation.repository";
import {IMessage} from "../models/message.model";
import {MessageRepository} from "../repositories/message.repository";
import {ConversationDto} from './dto/conversation.dto';
import {ProfileService} from './profile.service';
import {PetService} from './pet.service';
import {MessageDto} from './dto/messages.dto';
import {NotificationService} from './notification.service';

export class ConversationService {

  public static async create(members: IConversationMember[]): Promise<IConversation> {
    return await ConversationRepository.create({members});
  }

  public static async getByMember(memberId: string): Promise<ConversationDto[]> {
    const conversations = await ConversationRepository.getByMember(memberId);
    const dtos: ConversationDto[] = [];

    for (const conversation of conversations) {
      const dto: any = await this.toConversationDto(conversation, memberId);
      if (dto) {
        dtos.push(dto);
      }
    }

    return dtos;
  }

  public static async getLastMessageDetails(conversationId: string, memberId: string): Promise<{ lastMessage: IMessage, unreadCount: number }> {
    const messages = (await this.getMessagesByConversation(conversationId)).sort((a, b) => b.createdAt - a.createdAt);

    let unread = 0;

    messages.forEach(message => {
      if (message.isUnread && message.to == memberId) {
        unread++;
      }
    });

    return {lastMessage: messages[0], unreadCount: unread};
  }

  public static async toConversationDto(conversation: IConversation, memberId: string): Promise<ConversationDto | null> {
    const member = conversation.members.find(member => member.profileId !== memberId)!;

    const profile: any = (await ProfileService.getById(member.profileId))!;
    if (!profile) {
      return null;
    }
    const pet = member.petId ? await PetService.getById(member.petId) : null;

    const {lastMessage, unreadCount} = await this.getLastMessageDetails(conversation._id, memberId);


    return {
      _id: conversation._id,
      profileId: profile._id,
      profileName: `${profile.name} ${profile.lastName}`,
      petName: pet ? pet.name : profile.pets[0]?.name,
      profileImage: profile.image,
      petId: pet ? member.petId : profile.pets[0]?.petId,
      petImage: pet ? pet.image : profile.pets[0]?.image,
      lastDate: lastMessage?.createdAt,
      city: profile.city,
      unreadCount: unreadCount,
      lastMessage: lastMessage?.text,
      from: lastMessage?.from
    };
  }

  public static async reset(profileId: string) {
    const conversations = await this.getByMember(profileId);

    for (const con of conversations) {
      await MessageRepository.deleteByConversationId(con._id);
      await ConversationRepository.delete(con._id);
    }
  }

  public static async delete(conversationId: string) {
    await MessageRepository.deleteByConversationId(conversationId);
    await ConversationRepository.delete(conversationId);
  }

  public static async getMessagesByConversation(conversationId: string): Promise<IMessage[]> {
    const messages = await MessageRepository.getByConversationId(conversationId);

    return messages.sort((message1: IMessage, message2: IMessage) => message1.createdAt - message2.createdAt);
  }

  public static async getMessagesByConversationForUser(conversationId: string, profileId: string): Promise<MessageDto[]> {
    const messages = await MessageRepository.getByConversationId(conversationId);

    await this.unreadMessages(conversationId, profileId);

    return messages
      .map(message => {
        return {_id: message._id, from: message.from, text: message.text, createdAt: message.createdAt}
      })
      .sort((message1: MessageDto, message2: MessageDto) => message1.createdAt - message2.createdAt);
  }

  public static async unreadMessages(conversationId: string, profileId: string) {
    const messages = await this.getUnreadMessagesByConversationIdAndTo(conversationId, profileId);

    console.log(messages);

    for (const message of messages) {
      message.isUnread = false;
      await this.update(message);
    }
  }

  public static async update(message: IMessage): Promise<IMessage> {
    const data = {
      from: message.from,
      to: message.to,
      text: message.text,
      createdAt: message.createdAt,
      isUnread: message.isUnread,
      conversationId: message.conversationId,
    };

    return await MessageRepository.update(data, message._id);
  }

  public static async getUnreadMessagesByConversationIdAndTo(conversationId: string, profileId: string): Promise<IMessage[]> {
    return await MessageRepository.getUnreadMessagesByConversationIdAndTo(conversationId, profileId);
  }

  public static async sendMessage(message: any, conversationId: string): Promise<MessageDto> {
    message.createdAt = Date.now();
    message.isUnread = true;
    message.conversationId = conversationId;

    const savedMessage = await MessageRepository.create(message);

    const fromProfile = await ProfileService.getById(savedMessage.from);

    await NotificationService.sendNotification(
      savedMessage.to, {
        _id: savedMessage._id,
        fromUser: savedMessage.from,
        text: savedMessage.text,
        createdAt: savedMessage.createdAt + '',
        conversationId: savedMessage.conversationId,
        type: 'message',
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },
      {
        title: `${fromProfile?.lastName} ${fromProfile?.name}`,
        body: savedMessage.text
      }
    );

    return {_id: savedMessage._id, from: savedMessage.from, text: savedMessage.text, createdAt: savedMessage.createdAt};
  }
}
