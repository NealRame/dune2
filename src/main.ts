import {
    createApp,
    h,
} from "vue"

import App from "./components/App.vue"

import Router from "./router"

(function () {
    const app = createApp({
        render: () => h(App),
    })
    app
        .use(Router)
        .mount("#app")
})()
