<template>
    <div id="app">
        <div id="greeting_block" v-if="!authenticated">
            <greeting></greeting>
            <authentication></authentication>
        </div>

        <v-card v-if="authenticated" height="100vh">
            <v-card-row class="blue white--text" height="10vh">
                <v-menu bottom right>
                    <v-btn icon="icon" slot="activator" dark>
                        <v-icon>more_vert</v-icon>
                    </v-btn>
                    <v-list>
                        <v-list-item v-for="item in items" :key="item">
                            <v-list-tile>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile>
                        </v-list-item>
                    </v-list>
                </v-menu>

                <v-card-title>Hello!</v-card-title>

                <v-menu bottom right style="width:120px">
                    <v-btn icon="icon" slot="activator" dark style="width:100px">
                        <v-icon>account_circle</v-icon>
                        / ACCOUNT
                    </v-btn>
                    <v-list>
                        <v-list-item v-for="item in items" :key="item">
                            <v-list-tile>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-card-row>
            <v-card-text style="background-color:aliceblue; height:90vh">
                // CONTENT GOES HERE
            </v-card-text>
        </v-card>

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
				authenticated: false,
                items: [
                    {title: 'First'},
                    {title: 'Second'},
					{title: 'Third'},
					{title: 'Fourth'}
                ]
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
		}
	}
</script>

<style scoped>
    #greeting_block {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }

</style>
