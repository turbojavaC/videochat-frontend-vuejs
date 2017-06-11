<template>

    <div>
        <h4>This is WebRTC, baby ;)</h4>
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

    export default {
    	data () {
    		return {
                startButton: '',
                startButton_disabled: false,
                callButton: '',
                callButton_disabled: true,
                hangupButton: '',
                hangupButton_disabled: true,
                startTime: '',
                localVideo: '',
                remoteVideo: '',
                localStream: '',
                pc1: '',
                pc2: '',
                offerOptions: {
					offerToReceiveAudio: 1,
					offerToReceiveVideo: 1
                },
				isInitiator: false,
				isChannelReady: false,
			    isStarted: false
            }
        },
        computed: {

        },
        methods: {
    		/* Prepare local Stream */
			start () {
				console.info('WebRTC:', 'Requesting local stream');
				this.startButton_disabled = true;
				navigator.mediaDevices.getUserMedia({
					audio: true,
					video: true
				})
					.then(this.gotStream)
					.catch(function(e) {
						alert('getUserMedia() error: ' + e.name);
					});
			},
			gotStream (stream) {
				console.info('WebRTC:', 'Received local stream');
				this.localVideo.srcObject = stream;
				this.localStream = stream;
				this.callButton_disabled = false;
				bus.$emit('send-message', 'got user media')
			},
            /* Connect with remote stream */
			call () {
				// change button states
				this.callButton_disabled = true;
				this.hangupButton_disabled = false;

				console.info('WebRTC:', 'Starting call');
				this.startTime = window.performance.now();

				// set local video and audio tracks
				let videoTracks = this.localStream.getVideoTracks();
				window.localVideoTracks = videoTracks;
				let audioTracks = this.localStream.getAudioTracks();
				window.localAudioTracks = audioTracks;
				if (videoTracks.length > 0) {
					console.info('WebRTC:', 'Using video device: ' + videoTracks[0].label);
				}
				if (audioTracks.length > 0) {
					console.info('WebRTC:', 'Using audio device: ' + audioTracks[0].label);
				}

				// in servers, STUN and TURN servers could be specified
				let servers = null;
				// start local peer connection
				this.pc1 = new RTCPeerConnection(servers);
				console.info('WebRTC:', 'Created local peer connection object pc1');
				this.pc1.onicecandidate = (e) => {
					this.onIceCandidate(this.pc1, e);
				};

				// start remote peer connection
				this.pc2 = new RTCPeerConnection(servers);
				console.info('WebRTC:', 'Created remote peer connection object pc2');
				this.pc2.onicecandidate = (e) => {
					this.onIceCandidate(this.pc2, e);
				};

				this.pc1.oniceconnectionstatechange = (e) => {
					this.onIceStateChange(this.pc1, e);
				};

				this.pc2.oniceconnectionstatechange = (e) => {
					this.onIceStateChange(this.pc2, e);
				};

				this.pc2.ontrack = this.gotRemoteStream;

				this.localStream.getTracks().forEach(
					(track) => {
						this.pc1.addTrack(
							track,
							this.localStream
						);
					}
				);
				console.info('WebRTC:', 'Added local stream to pc1');

				console.info('WebRTC:', 'pc1 createOffer start');
				this.pc1.createOffer(
					this.offerOptions
				).then(
					this.onCreateOfferSuccess,
					this.onCreateSessionDescriptionError
				);
			},
			onIceCandidate (pc, event) {
				this.getOtherPc(pc).addIceCandidate(event.candidate)
					.then(
						() => {
							this.onAddIceCandidateSuccess(pc);
						},
						(err) => {
							this.onAddIceCandidateError(pc, err);
						}
					);
				console.info('WebRTC:', this.getName(pc) + ' ICE candidate: \n' + (event.candidate ?
						event.candidate.candidate : '(null)'));
			},
			hangup () {
				console.info('WebRTC:', 'Ending call');
				this.pc1.close();
				this.pc2.close();
				this.pc1 = null;
				this.pc2 = null;
				this.hangupButton_disabled = true;
				this.callButton_disabled = false;
			},
            getName (pc) {
				return (pc === this.pc1) ? 'pc1' : 'pc2';
            },
            getOtherPc (pc) {
				return (pc === this.pc1) ? this.pc2 : this.pc1;
            },
			onCreateSessionDescriptionError (error) {
				console.info('WebRTC:', 'Failed to create session description: ' + error.toString());
            },
			onCreateOfferSuccess (desc) {
				const that = this;

				console.info('WebRTC:', 'Offer from pc1\n' + desc.sdp); //todo: send this to remote client
				bus.$emit('send-sdp', 'it contains the SDP',desc.sdp);

				console.info('WebRTC:', 'pc1 setLocalDescription start');
				this.pc1.setLocalDescription(desc).then(
					function() {
						that.onSetLocalSuccess(that.pc1);
					},
					that.onSetSessionDescriptionError
				);
				console.info('WebRTC:', 'pc2 setRemoteDescription start');
				this.pc2.setRemoteDescription(desc).then( //todo: get remote description and pass it here
					function() {
						that.onSetRemoteSuccess(that.pc2);
					},
					that.onSetSessionDescriptionError
				);
				console.info('WebRTC:', 'pc2 createAnswer start');
				// Since the 'remote' side has no media stream we need
				// to pass in the right constraints in order for it to
				// accept the incoming offer of audio and video.
				this.pc2.createAnswer().then(
					that.onCreateAnswerSuccess,
					that.onCreateSessionDescriptionError
				);
			},
			onSetLocalSuccess (pc) {
				console.info('WebRTC:', this.getName(pc) + ' setLocalDescription complete');
            },
			onSetRemoteSuccess (pc) {
				console.info('WebRTC:', this.getName(pc) + ' setRemoteDescription complete');
            },
			onSetSessionDescriptionError (error) {
				console.info('WebRTC:', 'Failed to set session description: ' + error.toString());
            },
            gotRemoteStream (e) {
				if (this.remoteVideo.srcObject !== e.streams[0]) {
					this.remoteVideo.srcObject = e.streams[0];
					console.info('WebRTC:', 'pc2 received remote stream');
				}
            },
			onCreateAnswerSuccess (desc) {
				const that = this;

				console.info('WebRTC:', 'Answer from pc2:\n' + desc.sdp);
				console.info('WebRTC:', 'WebRTC:', 'pc2 setLocalDescription start');
				this.pc2.setLocalDescription(desc).then(
					function() {
						that.onSetLocalSuccess(that.pc2);
					},
					this.onSetSessionDescriptionError
				);
				console.info('WebRTC:', 'pc1 setRemoteDescription start');
				this.pc1.setRemoteDescription(desc).then(
					function() {
						that.onSetRemoteSuccess(that.pc1);
					},
					this.onSetSessionDescriptionError
				);
            },
			onAddIceCandidateSuccess (pc) {
				console.info('WebRTC:', this.getName(pc) + ' addIceCandidate success');
            },
			onAddIceCandidateError (pc, error) {
				console.info('WebRTC:', this.getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
            },
			onIceStateChange (pc, event) {
				if (pc) {
					console.info('WebRTC:', this.getName(pc) + ' ICE state: ' + pc.iceConnectionState);
					console.log('ICE state change event: ', event);
				}
            },
            maybeStart () {
                //todo: finish
            },
		},
        mounted () {
    		const that = this;

            this.startButton = document.getElementById('startButton');
			this.startButton = document.getElementById('callButton');
			this.startButton = document.getElementById('hangupButton');

			this.localVideo = document.getElementById('localVideo');
			this.remoteVideo = document.getElementById('remoteVideo');

			this.localVideo.addEventListener('loadedmetadata', function() {
				console.info('WebRTC:', 'Local video videoWidth: ' + this.videoWidth +
					'px,  videoHeight: ' + this.videoHeight + 'px');
			});

			this.remoteVideo.addEventListener('loadedmetadata', function() {
				console.info('WebRTC:', 'Remote video videoWidth: ' + this.videoWidth +
					'px,  videoHeight: ' + this.videoHeight + 'px');
			});

			bus.$on('receive-message', function () {
				if (message === 'got user media') {
					this.maybeStart();
				} else if (message.type === 'offer') {
					if (!isInitiator && !isStarted) {
						this.maybeStart();
					}
					this.pc.setRemoteDescription(new RTCSessionDescription(message));
					// emit to WebRTC
					this.doAnswer();
				} else if (message.type === 'answer' && isStarted) {
					pc.setRemoteDescription(new RTCSessionDescription(message));
				} else if (message.type === 'candidate' && isStarted) {
					var candidate = new RTCIceCandidate({
						sdpMLineIndex: message.label,
						candidate: message.candidate
					});
					pc.addIceCandidate(candidate);
				} else if (message === 'bye' && isStarted) {
					handleRemoteHangup();
				}
			})

        }
    }
</script>

<style scoped>

</style>