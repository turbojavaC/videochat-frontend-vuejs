<template>

    <div>
        <v-btn primary dark @click.native="login()" v-show="!authenticated">LOGIN</v-btn>
        <v-btn primary dark @click.native="logout()" v-show="authenticated">LOGOUT</v-btn>
        <p v-show="authenticated">You are logged in as {{ name }}</p>
    </div>

</template>

<script>
	export default {
		name: 'login',
		data () {
			return {
				authenticated: false,
                secretThing: '',
				lock: new Auth0Lock('bvWAKPvc_eirizgokSzyGQMq-nsyMZNG', 'olegkorol.eu.auth0.com')
			}
		},
        computed: {
            name: function () {
               const profile = JSON.parse(localStorage.getItem('profile'));
               return profile.name;
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
				});
			});

			this.lock.on('authorization_error', (error) => {
				// handle error when authorizaton fails
                console.error('Could not authorize', error)
			});
        },
        methods: {
			login () {
				this.lock.show();
			},
			logout () {
				localStorage.removeItem('id_token');
				localStorage.removeItem('profile');
				this.authenticated = false;
			},
			checkAuth () {
				return !!localStorage.getItem('id_token');
			}
        }
	}
</script>

<style scoped>

</style>