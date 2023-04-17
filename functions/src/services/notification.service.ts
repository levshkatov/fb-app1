import {Connections} from '../utils/connections';

export class NotificationService {

  public static async sendNotification(userId: string, data: any, notification: any) {
    const message = {
      data: data,
      notification: notification,
      topic: userId
    };

    await Connections.admin.messaging().send(message)
      .then((response: any) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error: any) => {
        console.log('Error sending message:', error);
      });
  }
}
