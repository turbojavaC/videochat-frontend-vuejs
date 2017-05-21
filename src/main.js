import Vue from 'vue'
import Vuetify from 'vuetify'

import App from './App.vue'
import Authentication from './components/LoginDialog.vue'

Vue.use(Vuetify);

Vue.component('authentication', Authentication);

export const bus = new Vue();

new Vue({
  el: '#app',
  render: h => h(App)
});
