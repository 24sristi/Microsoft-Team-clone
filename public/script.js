const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3030'
});


let myVideoStream
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    });
  }, err => { console.log(err); })


  socket.on('user-connected', (userId) => {
    setTimeout(() => {
      //user joined
      connectToNewUser(userId, stream);
    }, 1000)
  })
});

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
}


const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}

let msg = $('input')

$('html').keydown((e) =>{
  if (e.which == 13 && msg.val().length !== 0) {
    console.log(msg.val())
    socket.emit('message', msg.val());
    msg.val('')
  }
})

socket.on('createMessage',message => {
  $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
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
    <span>Mute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
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
    <span>Stop Video</span>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}

