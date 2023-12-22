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


// App services
const {UserService} = require('./services/user')
const US = new UserService(UR);

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

const ws = new WebSocket(io);
ws.startConnection()

app.use(cors({
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"],
    })
);



UserAPI(app, US);



server.listen(3000, ()=>console.log("Server is listening at port 3000!"))