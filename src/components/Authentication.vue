<template>

    <div>
        <v-btn primary dark @click.native="login()" v-show="!authenticated">LOGIN</v-btn>
        <v-btn primary dark @click.native="logout()" v-show="authenticated">LOGOUT</v-btn>
        <p v-if="authenticated"> You logged in as <b>{{ name }}</b> with <b>{{ provider }}</b>.</p>
    </div>

</template>

<script>
    import { bus } from '../main.js'

	export default {
		name: 'login',
		data () {
			return {
				authenticated: false,
                secretThing: '',
				lock: new Auth0Lock(process.env.AUTH0_CLIENT_ID, process.env.AUTH0_DOMAIN)
			}
		},
        computed: {
            name: function () {
               const profile = JSON.parse(localStorage.getItem('profile'));
               return profile.name;
			},
            provider: function () {
				const profile = JSON.parse(localStorage.getItem('profile'));
				return profile.identities[0].provider
            }
        },
		methods: {
			login () {
				this.lock.show();
			},
			logout () {
				localStorage.removeItem('id_token');
				localStorage.removeItem('profile');
				this.authenticated = false;
				bus.$emit('authStatus', this.authenticated)
			},
			checkAuth () {
				return !!localStorage.getItem('id_token');
			}
		},
        beforeMount () {
			this.authenticated = this.checkAuth();

			this.lock.on('authenticated', (authResult) => {
				console.log('authenticated');
				localStorage.setItem('id_token', authResult.idToken);
				this.lock.getProfile(authResult.idToken, (error, profile) => {
					if (error) {
						console.error(error);
						return;
					}
					// Set the token and user profile in local storage
					localStorage.setItem('profile', JSON.stringify(profile));

					this.authenticated = true;
					bus.$emit('authStatus', this.authenticated)
				});
			});

			this.lock.on('authorization_error', (error) => {
				// handle error when authorizaton fails
                console.error('Could not authorize', error)
			});
        }
	}
</script>

<style scoped>

</style>