<template>

    <div>
        <img src="../assets/logo.png">
        <h3>{{ greeting }}</h3>
    </div>

</template>

<script>
    import { bus } from '../main.js'

	export default {
		name: 'greeting',
		data () {
			return {
				greeting: 'Welcome to the Vuedio Chat App!'
			}
		}
	}
</script>

<style scoped>

</style>