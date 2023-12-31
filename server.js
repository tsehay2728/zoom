const express = require("express");
const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomID: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomID, userID) => {
    socket.join(roomID);
    socket.to(roomID).broadcast.emit("user-connected", userID);

    socket.on("message", (message) => {
      io.to(roomID).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomID).broadcast.emit("user-disconnected", userID);
    });
  });
});

server.listen(process.env.PORT || 3000);
