import {IRequest} from "../models/request.model";
import {RequestRepository} from "../repositories/request.repository";
import {SearchService} from "./search.service";
import {ConversationService} from "./conversation.service";
import {RequestDto} from './dto/request.dto';
import {ProfileService} from './profile.service';
import {ConversationDto} from './dto/conversation.dto';
import {NotificationService} from './notification.service';


export class RequestService {

    public static async create(profileId: string, receiver: string, receiverPet: string): Promise<{status: string, data: any}> {
        if (await this.isDoubleLike(profileId, receiver, receiverPet)) {
            return {status: 'MATCH', data: null};
        }

        const profile = await ProfileService.getById(profileId);

        if (profile!.requestLeft == 0) {
            return {status: 'REQUEST LIMIT', data: null};
        }

        const request = await RequestRepository.create({profileId, receiver, receiverPet, createdAt: Date.now()});

        await NotificationService.sendNotification(
          receiver,
          {
              profileId: request.profileId,
              receiver: request.receiver,
              createdAt: request.createdAt.toString(),
              type: 'like',
              click_action: "FLUTTER_NOTIFICATION_CLICK"
          },
          {
              title: `New request`,
              body: `${profile?.lastName} ${profile?.name} liked you!`
          }
        );

        profile!.requestLeft = profile!.requestLeft - 1;
        await ProfileService.update(profile!, null, '', '');

        SearchService.updateByRequest(request);

        return {status: 'LIKED', data: request};
    }

    public static async accept(requestId: string): Promise<ConversationDto | null> {
        const request = await this.getById(requestId);

        const conversation = await ConversationService.create([{profileId: request.profileId, petId: null}, {profileId: request.receiver, petId: request.receiverPet}]);

        this.delete(requestId);

        return await ConversationService.toConversationDto(conversation, request.profileId);
    }

    public static async delete(requestId: string) {
        await RequestRepository.delete(requestId);
    }

    public static async getById(requestId: string): Promise<IRequest> {
        return await RequestRepository.getById(requestId);
    }

    public static async reset(profileId: string): Promise<any> {
        for (const request of (await RequestRepository.getAll())) {
            if (request.profileId == profileId) {
                await this.delete(request._id);
            }
        }
    }

    public static async getByReceiver(profileId: string): Promise<RequestDto[]> {
        const requests = await RequestRepository.getByReceiver(profileId);

        const dtos: RequestDto[] = [];

        for (const request of requests) {
            const profile: any = (await ProfileService.getById(request.profileId))!;
            if (!profile) {
                continue;
            }
            const pet = profile.pets[0];

            dtos.push({
                _id: request._id,
                profileName: profile.name,
                petName: pet.name,
                profileImage: profile.image,
                petImage: pet.image,
                profileId: request.profileId,
                petId: pet._id,
                createdAt: request.createdAt
            });
        }

        return dtos;
    }

    private static async isDoubleLike(profileId: string, receiver: string, receiverPet: string): Promise<boolean> {
        const requests = await RequestRepository.getByReceiver(profileId);
        const doubleRequest = requests.find(request => request.profileId == receiver);

        if (doubleRequest) {
            await NotificationService.sendNotification(
              receiver,
              {
                  profileId: profileId,
                  type: 'doubleLike',
                  click_action: "FLUTTER_NOTIFICATION_CLICK"
              },
              {
                  title: `It's Match`,
                  body: ``
              }
            );

            await NotificationService.sendNotification(
              profileId,
              {
                  profileId: receiver,
                  type: 'doubleLike',
                  click_action: "FLUTTER_NOTIFICATION_CLICK"
              },
              {
                  title: `It's Match`,
                  body: ``
              }
            );

            await RequestRepository.delete(doubleRequest._id);
            await ConversationService.create([{
                profileId: profileId,
                petId: null
            },
                {
                profileId: receiver,
                petId: receiverPet
            }]);
            return true;
        }

        return false;
    }
}
