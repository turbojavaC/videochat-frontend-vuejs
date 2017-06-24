<template>

    <div>
		<h5>Create or join a room.</h5>
        <input type="text" placeholder="Enter room name" v-model="room">
        <button v-on:click="submitRoom">Submit</button>
    </div>

</template>

<script>
	import io from 'socket.io-client'
	import { bus } from '../main.js'

    export default {
    	data() {
    		return {
				socket: io(process.env.SOCKET_IO_URL || 'http://localhost:3000'),
                socketConnection: '',
				room: '',
				currentRoom: 'none'
            }
        },
        methods: {
            submitRoom () {
				if (this.room !== "") {
					console.log('Socket.io: Asking to join room ' + this.room);
					this.socket.emit('create or join', this.room);
					this.room = '';
				} else {
					alert('Room cannot be empty')
                }
            }
        },
        mounted() {

			this.socket.on('message', function(message) {
				console.info('Client got a message =>', message);
				bus.$emit('msg', message)
			});

			bus.$on('message', function (message) {
				console.log('Client emitting message to sockets');
                this.socket.emit('message', message)
			});

			// connection
    		this.socket.on('connect', () => {
                console.info('Client:', 'connected. The socket-id is', this.socket.id);
			});

    		// custom events
		    this.socket.on('server-log', data => {
		    	console.info(data)
            });

			this.socket.on('created', function(room, clientId) {
				console.log('Client: Created room ' + room + ' with client ' + clientId);
				this.isInitiator = true;
				this.currentRoom = room;
				bus.$emit('entered-room', room)
			});

			this.socket.on('joined', function(room, clientId) {
				console.log('Client: Joined room ' + room + ' with client ' + clientId);
				this.isInitiator = false;
				this.currentRoom = room;
				bus.$emit('entered-room', room)
			});

			this.socket.on('full', function(room) {
				console.log('Client: Room ' + room + ' is full');
			});

			this.socket.on('ipaddr', function(ipaddr) {
				console.log('Client: Server IP address is ' + ipaddr);
			});

		    // disconnection
			this.socket.on('disconnect', () => {
				console.info('Client:', 'disconnected')
			})
        }
    }

</script>

<style scoped></style>
