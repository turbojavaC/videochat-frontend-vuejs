import Vue from 'vue'
import Vuetify from 'vuetify'

import App from './App.vue'
import Authentication from './components/LoginDialog.vue'

Vue.use(Vuetify);

Vue.component('authentication', Authentication);

new Vue({
  el: '#app',
  render: h => h(App)
});
