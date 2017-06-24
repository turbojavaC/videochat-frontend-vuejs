// Vue basics
import Vue from 'vue'

// External libraries
import Vuetify from 'vuetify'
import WebRTC from 'webrtc-adapter'

Vue.use(Vuetify);
Vue.use(WebRTC);

// Internal components
import App from './App.vue'
import Authentication from './components/Authentication.vue'

// Mount internal components globally
Vue.component('authentication', Authentication);

// Event Bus
export const bus = new Vue();

new Vue({
  el: '#app',
  render: h => h(App)
});
