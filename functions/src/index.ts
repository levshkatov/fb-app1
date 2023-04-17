import {Connections} from "./utils/connections";
import {ProfileController} from "./controllers/profile.controller";
import {PetController} from "./controllers/pet.controller";
import {SearchController} from "./controllers/search.controller";
import {AdminController} from "./controllers/admin.controller";
import cors from 'cors';
import {AuthService} from './services/auth.service';
import {RequestController} from './controllers/request.controller';
import {ConversationController} from './controllers/conversation.controller';

const  express = require ("express");
const bodyParser = require("body-parser");

const admin = require('firebase-admin');
const functions = require('firebase-functions');

const serviceAccount = require("../serviceAccountKey.json");


const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "*"
});

Connections.dbConnection = admin.firestore();
Connections.avatarBucket = admin.storage;
Connections.admin = admin;



app.use(async (req: any, res: any, next: any) => {

    if (req._parsedUrl.pathname.includes("/api/admin")) {
        next();
        return;
    }

    const authorization = req.header("Authorization");

    if (authorization && authorization.includes("Bearer")) {
        try {
           const payload: any = await AuthService.checkAuthorization(authorization ? authorization.substring(7) : "");
           req.userId = "admin";
           next();
           return;
        } catch (e) {
           res.status(401).send("Unauthorized.");
            return;
        }
    }

    try {
        const payload: any = await AuthService.checkFirebaseAuthorization(authorization ? authorization : "");
        req.userId = payload;
    } catch (e) {
        console.log(e);
        res.status(401).send("Unauthorized.");
        return;
    }

    next();
});

app.use(async (req: any, res: any, next: any) => {
    console.log(`${req.userId}: ${req.method} ${req.path}`);
    next();
});

app.use("/api/profiles", new ProfileController().getRouter());
app.use("/api/pets", new PetController().getRouter());
app.use("/api/search", new SearchController().getRouter());
app.use("/api/admin", new AdminController().getRouter());
app.use("/api/conversations", new ConversationController().getRouter());
app.use("/api/requests", new RequestController().getRouter());

exports.widgets = functions.https.onRequest(app);
