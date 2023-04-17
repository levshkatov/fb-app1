import {Connections} from "../utils/connections";
import {uuid} from 'uuidv4';

export class FileService {

    public static async getImageLink(image: any, extension: string, contentType: string) {
        if (!image) {
            return null;
        }

        const filename = uuid() + extension;

        const file = Connections.avatarBucket().bucket().file(filename);

        await file.save(image, {
          metadata: {
            contentType: contentType,
          },
          public: true,
        });

        return `${filename}`;
    }

}
