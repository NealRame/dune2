import {
    createApp,
    h,
} from "vue"

import {
    createPinia,
} from "pinia"

import App from "./components/App.vue"

import router from "./router"

(function () {
    const pinia = createPinia()
    const app = createApp({
        render: () => h(App),
    })
    app
        .use(pinia)
        .use(router)
        .mount("#app")
})()
