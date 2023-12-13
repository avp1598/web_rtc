let localStream;
let remoteStream;

let servers = {
  iceServers: [
    {
      urls: "stun:206.189.141.42:3478",
    },
    {
      urls: "turn:206.189.141.42:3478",
      username: "user",
      credential: "secret",
    },
  ],
};
let peerConnection = new RTCPeerConnection(servers);

let init = async () => {
  console.log("Init triggered");
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  remoteStream = new MediaStream();
  document.getElementById("user-1").srcObject = localStream;
  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };
};

let createOffer = async () => {
  peerConnection.onicecandidate = async (event) => {
    //Event that fires off when a new offer ICE candidate is created
    if (event.candidate) {
      console.log("Adding offer candidate...:", event.candidate);
      document.getElementById("offer-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
};

let createAnswer = async () => {
  let offer = JSON.parse(document.getElementById("offer-sdp").value);

  peerConnection.onicecandidate = async (event) => {
    //Event that fires off when a new answer ICE candidate is created
    if (event.candidate) {
      console.log("Adding answer candidate...:", event.candidate);
      document.getElementById("answer-sdp").value = JSON.stringify(
        peerConnection.localDescription
      );
    }
  };

  await peerConnection.setRemoteDescription(offer);

  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
};

let addAnswer = async () => {
  console.log("Add answer triggerd");
  let answer = JSON.parse(document.getElementById("answer-sdp").value);
  console.log("answer:", answer);
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(answer);
  }
};

init();

document.getElementById("create-offer").addEventListener("click", createOffer);
document
  .getElementById("create-answer")
  .addEventListener("click", createAnswer);
document.getElementById("add-answer").addEventListener("click", addAnswer);
