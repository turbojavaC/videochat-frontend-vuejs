<template>
    <div id="app">
        <img src="./assets/logo.png">
        <h3>{{ greeting }}</h3>
        <authentication></authentication>
    </div>
</template>

<script>
	export default {
		name: 'app',
		data () {
			return {
				greeting: 'Welcome to the Vuedio Chat App!',
			}
		},
		methods: {
			authenticated: function () {
				return localStorage.getItem('id_token')
			}
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
