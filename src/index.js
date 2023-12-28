const express = require("express");
const app = express();
const cors = require("cors")
//For socketIO
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

// APIs
const {UserAPI} = require('./API/user')
// App Repos
const {UserRepo} = require("./DB/Mongo/Repositories/users")
const UR = new UserRepo()

const {ChatRepo} = require("./DB/Mongo/Repositories/Chat")
const CR = new ChatRepo();

const {FormRepo} = require("./DB/Mongo/Repositories/form");
const FR = new FormRepo();

// App services take their respective DB Repo as their dependency to have access to the DB.
const {UserService} = require('./services/user')
const US = new UserService(UR);

// Chat Service
const {ChatService} = require("./services/Chat")
const CS = new ChatService(CR);

// Form Service
const {FormService} = require("./services/form");
const FS = new FormService(FR);

const {OpenAI} = require("./services/OpenAI")
const OpenAIKey = "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";
const OAI = new OpenAI(OpenAIKey, "asst_gxFC1B7pDtcX2V6E9RDYf44b");


//Web Socket APP
const {WebSocket} = require("./WebSocket/webSocket") 

//Mongo
const {makeConnection} = require("./DB/Mongo/connection")
makeConnection()


const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());



const ws = new WebSocket(io, {chat:CS, openAI: OAI, form:FS}, OpenAIKey, "asst_gxFC1B7pDtcX2V6E9RDYf44b");
ws.startConnection()

app.use(cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"],
    })
);



UserAPI(app, US);


server.listen(3000, ()=>console.log("Server is listening at port 3000!"))