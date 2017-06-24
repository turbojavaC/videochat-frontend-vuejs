<template>

    <div>
        <socketio></socketio>
        <p id='current-room-status'></p>

        <p>WebRTC media:</p>
        <video id="localVideo" autoplay muted style="background-color: antiquewhite; width:250px"></video>
        <video id="remoteVideo" autoplay style="background-color: bisque; width:250px"></video>
        <div>
            <v-btn primary dark id="startButton" v-bind:disabled="startButton_disabled" @click.native="start">Start</v-btn>
            <v-btn primary dark id="callButton" v-bind:disabled="callButton_disabled" @click.native="call">Call</v-btn>
            <v-btn primary dark id="hangupButton" v-bind:disabled="hangupButton_disabled" @click.native="hangup">Hang Up</v-btn>
        </div>

        <br>
        <hr>
        <br>

        <authentication></authentication>
    </div>

</template>

<script>
	import { bus } from '../main.js'
	import SocketIO from './SocketIO.vue'

	export default {
		components: {
			'socketio': SocketIO
		},
		data () {
			return {
				socketRoom: 'null',
				startButton: '',
				startButton_disabled: false,
				callButton: '',
				callButton_disabled: true,
				hangupButton: '',
				hangupButton_disabled: true,
				localVideo: '',
				remoteVideo: '',
				isInitiator: false,
				isStarted: false,
				isChannelReady: false,
				pc: ''
			}
		},
		methods: {
			start() {
				this.startButton_disabled = true;
				navigator.mediaDevices.getUserMedia({
					audio: true,
					video: true
				})
					.then(this.gotStream)
					.catch(function(e) {
						console.error('getUserMedia() error: ' + e);
					});

				this.callButton_disabled = false;
				this.hangupButton_disabled = false;
			},
            call() {
				alert('not yet implemented')
                //todo: call a specific user
            },
            hangup() {
				alert('fuck off!')
				//this.callButton_disabled = false;
				//todo: terminate session here
            },
			gotStream(stream) {
				debugger;
				console.log('Adding local stream.');
				this.localVideo.srcObject = stream;
				this.localStream = stream;
				this.sendMessage('got user media');
				if (this.isInitiator) {
					this.maybeStart();
				}
			},
            sendMessage(message) {
				console.log('Client sending message...');
				debugger;
				console.log(bus);
                bus.$emit('message', message)
            },
			maybeStart() {
				debugger;
				console.log('>>>>>>> maybeStart() ', this.isStarted, this.localStream, this.isChannelReady);
				if (!this.isStarted && typeof this.localStream !== 'undefined' && this.isChannelReady) {
					console.log('>>>>>> creating peer connection');
					this.createPeerConnection();
					this.pc.addStream(this.localStream);
					this.isStarted = true;
					console.log('isInitiator', this.isInitiator);
					if (this.isInitiator) {
						this.doCall();
					}
				}
			},
			createPeerConnection() {
				debugger;
				try {
					this.pc = new RTCPeerConnection(null);
					this.pc.onicecandidate = this.handleIceCandidate;
					this.pc.onaddstream = this.handleRemoteStreamAdded;
					this.pc.onremovestream = this.handleRemoteStreamRemoved;
					console.log('Created RTCPeerConnection');
				} catch (e) {
					console.log('Failed to create PeerConnection, exception: ' + e.message);
					alert('Cannot create RTCPeerConnection object.');
				}
			},
			handleIceCandidate() {
				debugger;
				console.log('icecandidate event: ', event);
				if (event.candidate) {
					this.sendMessage({
						type: 'candidate',
						label: event.candidate.sdpMLineIndex,
						id: event.candidate.sdpMid,
						candidate: event.candidate.candidate
					});
				} else {
					console.log('End of candidates.');
				}
			},
			handleRemoteStreamAdded(event) {
				debugger;
				console.log('Remote stream added.');
				this.remoteVideo.src = window.URL.createObjectURL(event.stream);
				this.remoteStream = event.stream;
			},
			handleRemoteStreamRemoved(event) {
				debugger;
				console.log('Remote stream removed. Event: ', event);
			},
			doCall() {
				debugger;
				console.log('Sending offer to peer');
				this.pc.createOffer(this.setLocalAndSendMessage, this.handleCreateOfferError);
			},
			setLocalAndSendMessage(sessionDescription) {
				debugger;
				// Set Opus as the preferred codec in SDP if Opus is present.
				//  sessionDescription.sdp = preferOpus(sessionDescription.sdp);
				this.pc.setLocalDescription(sessionDescription);
				console.log('setLocalAndSendMessage sending message', sessionDescription);
				this.sendMessage(sessionDescription);
			},
			handleCreateOfferError(event) {
				debugger;
				console.log('createOffer() error: ', event);
			}
		},
		mounted () {

			bus.$on('entered-room', function (room) {
                this.socketRoom = room;
                window.room = room
			});

			bus.$emit('event', function (event) {
                console.log('emitting event "event"')
			});

			bus.$on('msg', function (message) {
				console.log('BAM!', message, 'got here!');
				document.getElementById('current-room-status').innerHTML = message;
			});

			this.startButton = document.getElementById('startButton');
			this.callButton = document.getElementById('callButton');
			this.hangupButton = document.getElementById('hangupButton');

			this.localVideo = document.getElementById('localVideo');
			this.remoteVideo = document.getElementById('remoteVideo');

		}
	}
</script>

<style scoped>

</style>