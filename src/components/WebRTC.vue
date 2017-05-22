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
                }
            }
        },
        computed: {

        },
        methods: {
			trace (arg) {
				const now = (window.performance.now() / 1000).toFixed(3);
				console.log(now + ': ', arg);
			},
            getName (pc) {
				return (pc === this.pc1) ? 'pc1' : 'pc2';
            },
            getOtherPc (pc) {
				return (pc === this.pc1) ? this.pc2 : this.pc1;
            },
            gotStream (stream) {
				this.trace('Received local stream');
				this.localVideo.srcObject = stream;
				this.localStream = stream;
				this.callButton_disabled = false;
            },
            start () {
				this.trace('Requesting local stream');
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
            call () {
				const that = this;

				this.callButton_disabled = true;
				this.hangupButton_disabled = false;
				this.trace('Starting call');
				this.startTime = window.performance.now();
				let videoTracks = this.localStream.getVideoTracks();
				let audioTracks = this.localStream.getAudioTracks();
				if (videoTracks.length > 0) {
					this.trace('Using video device: ' + videoTracks[0].label);
				}
				if (audioTracks.length > 0) {
					this.trace('Using audio device: ' + audioTracks[0].label);
				}
				let servers = null;
				this.pc1 = new RTCPeerConnection(servers);
				this.trace('Created local peer connection object pc1');
				this.pc1.onicecandidate = function(e) {
					that.onIceCandidate(that.pc1, e);
				};
				this.pc2 = new RTCPeerConnection(servers);
				this.trace('Created remote peer connection object pc2');
				this.pc2.onicecandidate = function(e) {
					that.onIceCandidate(that.pc2, e);
				};

				this.pc1.oniceconnectionstatechange = function(e) {
					that.onIceStateChange(that.pc1, e);
				};

				this.pc2.oniceconnectionstatechange = function(e) {
					that.onIceStateChange(that.pc2, e);
				};

				this.pc2.ontrack = this.gotRemoteStream;

				this.localStream.getTracks().forEach(
					function(track) {
						that.pc1.addTrack(
							track,
							that.localStream
						);
					}
				);
				this.trace('Added local stream to pc1');

				this.trace('pc1 createOffer start');
				this.pc1.createOffer(
					this.offerOptions
				).then(
					this.onCreateOfferSuccess,
					this.onCreateSessionDescriptionError
				);
			},
			onCreateSessionDescriptionError (error) {
				this.trace('Failed to create session description: ' + error.toString());
            },
			onCreateOfferSuccess (desc) {
				const that = this;

				this.trace('Offer from pc1\n' + desc.sdp);
				this.trace('pc1 setLocalDescription start');
				this.pc1.setLocalDescription(desc).then(
					function() {
						that.onSetLocalSuccess(that.pc1);
					},
					that.onSetSessionDescriptionError
				);
				this.trace('pc2 setRemoteDescription start');
				this.pc2.setRemoteDescription(desc).then(
					function() {
						that.onSetRemoteSuccess(that.pc2);
					},
					that.onSetSessionDescriptionError
				);
				this.trace('pc2 createAnswer start');
				// Since the 'remote' side has no media stream we need
				// to pass in the right constraints in order for it to
				// accept the incoming offer of audio and video.
				this.pc2.createAnswer().then(
					that.onCreateAnswerSuccess,
					that.onCreateSessionDescriptionError
				);
			},
			onSetLocalSuccess (pc) {
				this.trace(this.getName(pc) + ' setLocalDescription complete');
            },
			onSetRemoteSuccess (pc) {
				this.trace(this.getName(pc) + ' setRemoteDescription complete');
            },
			onSetSessionDescriptionError (error) {
				this.trace('Failed to set session description: ' + error.toString());
            },
            gotRemoteStream (e) {
				if (this.remoteVideo.srcObject !== e.streams[0]) {
					this.remoteVideo.srcObject = e.streams[0];
					this.trace('pc2 received remote stream');
				}
            },
			onCreateAnswerSuccess (desc) {
				const that = this;

				this.trace('Answer from pc2:\n' + desc.sdp);
				this.trace('pc2 setLocalDescription start');
				this.pc2.setLocalDescription(desc).then(
					function() {
						that.onSetLocalSuccess(that.pc2);
					},
					this.onSetSessionDescriptionError
				);
				this.trace('pc1 setRemoteDescription start');
				this.pc1.setRemoteDescription(desc).then(
					function() {
						that.onSetRemoteSuccess(that.pc1);
					},
					this.onSetSessionDescriptionError
				);
            },
			onIceCandidate (pc, event) {
				const that = this;
				this.getOtherPc(pc).addIceCandidate(event.candidate)
					.then(
						function() {
							that.onAddIceCandidateSuccess(pc);
						},
						function(err) {
							that.onAddIceCandidateError(pc, err);
						}
					);
				this.trace(this.getName(pc) + ' ICE candidate: \n' + (event.candidate ?
						event.candidate.candidate : '(null)'));
            },
			onAddIceCandidateSuccess (pc) {
				this.trace(this.getName(pc) + ' addIceCandidate success');
            },
			onAddIceCandidateError (pc, error) {
				this.trace(this.getName(pc) + ' failed to add ICE Candidate: ' + error.toString());
            },
			onIceStateChange (pc, event) {
				if (pc) {
					this.trace(this.getName(pc) + ' ICE state: ' + pc.iceConnectionState);
					console.log('ICE state change event: ', event);
				}
            },
            hangup () {
				this.trace('Ending call');
				this.pc1.close();
				this.pc2.close();
				this.pc1 = null;
				this.pc2 = null;
				this.hangupButton_disabled = true;
				this.callButton_disabled = false;
            }
		},
        mounted () {
    		const that = this;

            this.startButton = document.getElementById('startButton');
			this.startButton = document.getElementById('callButton');
			this.startButton = document.getElementById('hangupButton');

			this.localVideo = document.getElementById('localVideo');
			this.remoteVideo = document.getElementById('remoteVideo');

			this.localVideo.addEventListener('loadedmetadata', function() {
				that.trace('Local video videoWidth: ' + this.videoWidth +
					'px,  videoHeight: ' + this.videoHeight + 'px');
			});

			this.remoteVideo.addEventListener('loadedmetadata', function() {
				that.trace('Remote video videoWidth: ' + this.videoWidth +
					'px,  videoHeight: ' + this.videoHeight + 'px');
			});

        }
    }
</script>

<style scoped>

</style>