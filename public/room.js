const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;
let Chat_button = document.querySelector('.main_chat_button')
let Chat_window = document.querySelector('.main_right')
let Video_window = document.querySelector('.main_left')
let main_screen_video = document.querySelector('.main_screen_video video');
let main_controls = document.querySelector('.main_controls')
let inviteButton = document.querySelector('.invite_btn')
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: 'milo-teams-clone.herokuapp.com',
  port: '443'
});


let myVideoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  main_screen_video.srcObject = stream;
  main_screen_video.addEventListener('loadedmetadata', () => {
    main_screen_video.play();
  })
  addVideoStream(myVideo, stream);
  myVideo.addEventListener("click", function () {
    main_screen_video.srcObject = stream;

  })

  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    video.classList.add("otherVideo")

    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
      video.addEventListener("click", function () {
        main_screen_video.srcObject = userVideoStream;

      })

    });
  }, err => { console.log(err); })


  socket.on('user-connected', (userId, userName) => {
    setTimeout(() => {
      //user joined
      connectToNewUser(userId, stream);
    }, 1000)
    $('.messages').append(`<li class="message notice-msg">${userName} joined the meeting</li>`);
  })
});

socket.on('user-disconnected', (userId, userName) => {
  if (peer[userId]) peer[userId].close()
  $('.messages').append(`<li class="message notice-msg">${userName} left the meeting</li>`);
})

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id, name);
})

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream)

  const video = document.createElement('video')

  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })
  peer[userId] = call
}


const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

let msg = $('input')

$('html').keydown((e) => {
  if (e.which == 13 && msg.val().length !== 0) {
    console.log(msg.val())
    socket.emit('message', msg.val(), name);
    msg.val('')
  }
})

socket.on('createMessage', (message, userName) => {
  let otherClsss = userName!=name?"other-msg":"my-msg"
  let chatClsss = userName!=name?"other-chat-msg":"my-chat-msg"
  $('.messages').append(`<div class="msg ${otherClsss}">
  <div class="msg-name">${userName}</div>
  <div class="msg-msg ${chatClsss}">${message}</div>
</div>`);
  scrollbottom()
})



const scrollbottom = () => {
  let d = $('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));

}

//mute video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}
const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}

Chat_button.addEventListener("click", function () {
  if (Chat_window.classList.contains("selected")) {
    Chat_window.classList.remove("selected")
    Chat_window.style.display = "none"
    Video_window.style.flex = "1"
    main_controls.style.width = "83%"
  }
  else {
    Chat_window.classList.add("selected")
    Chat_window.style.display = "flex"
    Video_window.style.flex = "0.8"
    main_controls.style.width = "61%"
  }
})
inviteButton.addEventListener("click", (e) => {
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});