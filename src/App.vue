<template>
    <div id="app">
        <greeting v-if="!authenticated"></greeting>
        <authentication></authentication>
    </div>
</template>

<script>
    import Greeting from './components/Greeting.vue'
	import { bus } from './main.js'

	export default {
		name: 'app',
        components: {
		    'greeting': Greeting
        },
		data () {
			return {
                authenticated: false
			}
		},
		methods: {
			checkAuthStatus () {
				this.authenticated = !!localStorage.getItem('id_token')
			},
			updateAuthStatus () {
				this.authenticated = !!localStorage.getItem('id_token')
			}
		},
		created () {
			this.checkAuthStatus();
			bus.$on('authStatus', this.updateAuthStatus)
		},
		updated () {
			this.checkAuthStatus();
			bus.$on('authStatus', this.updateAuthStatus)
		}
	}
</script>

<style scoped>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
    .hidden {
        display: none
    }
</style>
