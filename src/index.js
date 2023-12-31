const express = require("express");
const app = express();
const cors = require("cors")
//For socketIO
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

// APIs
const {UserAPI} = require('./API/user')
const {ExecutiveAPI} = require("./API/executive")
const {AdminAPI} = require("./API/admin")

// App Repos
const {UserRepo} = require("./DB/Mongo/Repositories/users")
const UR = new UserRepo()

const {AdminRepository} = require("./DB/Mongo/Repositories/admin")
const AR = new AdminRepository()

const {ChatRepo} = require("./DB/Mongo/Repositories/Chat")
const CR = new ChatRepo();

const {ExecutiveRepository} = require("./DB/Mongo/Repositories/executive");
const ER = new ExecutiveRepository;

const {FormRepo} = require("./DB/Mongo/Repositories/form");
const FR = new FormRepo();

const {FAQRepo} = require("./DB/Mongo/Repositories/FAQ")
const FaqRepo = new FAQRepo();

// App services take their respective DB Repo as their dependency to have access to the DB.
const {UserService} = require('./services/user')
const US = new UserService(UR);

// Chat Service
const {ChatService} = require("./services/Chat")
const CS = new ChatService(CR);

// Form Service
const {FormService} = require("./services/form");
const FS = new FormService(FR);


const {ExecutiveService} = require("./services/executive");
const ES = new ExecutiveService(ER)

const {FAQService} = require("./services/FAQ")
const FaqService = new FAQService(FaqRepo);

const {AdminServices} = require("./services/admin")
const adminService = new AdminServices(AR);

const {OpenAI} = require("./services/OpenAI")

const {OPENAI_SECRET_KEY} = require("./config")

const OAI = new OpenAI("asst_yyjt9xUUBAuJTKZ4KYUiZ0Xs", "asst_FjeOo9tfgw6EpWvQTgmKlGlm");


//Web Socket APP
const {WebSocket} = require("./WebSocket/webSocket") 

//Mongo
const {makeConnection} = require("./DB/Mongo/connection")
makeConnection()

//Initializing socket io with custom CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
});

//to accept JSON requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//websocket handler
const ws = new WebSocket(io, {chat:CS, openAI: OAI, form:FS, Faq: FaqService}, "asst_gxFC1B7pDtcX2V6E9RDYf44b");
ws.startConnection()

//http API CORS 
app.use(cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"],
    })
);


//Handling API's 
ExecutiveAPI(app, ES);
// UserAPI(app, US);
AdminAPI(app, {faq:FaqService, admin: adminService});


server.listen(3000, ()=>console.log("Server is listening at port 3000!"))