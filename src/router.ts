import {
    createRouter,
    createWebHistory,
    RouteRecordRaw,
} from "vue-router"

import Home from "./components/Home.vue"
import Game from "./components/Game.vue"

const routes: Array<RouteRecordRaw> = [{
    path: "/",
    name: "home",
    component: Home,
}, {
    path: "/game",
    name: "game",
    component: Game,
}]

const Router = createRouter({
    history: createWebHistory("/"),
    routes,
})

export default Router
