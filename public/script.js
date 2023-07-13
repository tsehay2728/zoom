const socket = io("/");

const videoGrid = document.getElementById("video-grid");
const myVideeo = document.createElement("video");
myVideeo.muted = true;

const myPeer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

const peers = {};

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideeo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      // call and answer
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userID) => {
      console.log("new user");
      connectToNewUser(userID, stream);
    });

    // input value
    let text = $("input");
    // when press enter send message
    $("html").keydown(function (e) {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (message) => {
      // console.log("'this is coming from server", message);
      $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
      scrollToBottom();
    });
  });

myPeer.on("open", (id) => {
  // console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});

socket.on("user-disconnected", (userID) => {
  if (peers[userID]) {
    peers[userID].close();
  }
});

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userID, stream) {
  const call = myPeer.call(userID, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });
  peers[userID] = call;
}

// const scrollToBottom = () => {
//   var d = $(".main__chat_window");
//   d.scrollTop(d.prop("scrollHeight"));
// };

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  // console.log(myVideoStream.getAudioTracks());
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  // console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  // console.log(myVideoStream.getVideoTracks());
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
