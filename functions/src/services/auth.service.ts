import bcrypt from "bcrypt-nodejs";
import jwt from "jsonwebtoken";
import {Connections} from "../utils/connections";


const SECRET_KEY = '*';


export class AuthService {
    public static async checkFirebaseAuthorization(token: string): Promise<any> {
        return await Connections.admin.auth().verifyIdToken(token)
            .then((decodedToken: any) => {
                return decodedToken.uid;
            }).catch((error: any) => {
                console.log(error);
                throw new Error("Invalid token!");
            });
    }

    public static checkAuthorization(token: string): string | object {
        return jwt.verify(token, SECRET_KEY);
    }

    public static async login(email: string, password: string): Promise<string> {
        if (!bcrypt.compareSync(password, '$2a$10$j3pCooNgW8mBl3cEepimsO7ou.eeQcTzKyaJ2oydfwyK8/mH40ImW')) {
            throw new Error("Email or password is incorrect.");
        }

        return this.buildAuthData(email);
    }

    public static async buildAuthData(email: string): Promise<string> {
        const expiration_date = Math.floor(Date.now() / 1000) + 60 * 60;

        return jwt.sign({
            email: email,
            exp: expiration_date
        }, SECRET_KEY, {algorithm: "HS256"});
    }
}
