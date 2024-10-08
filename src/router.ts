import {
    createRouter,
    createWebHistory,
    RouteRecordRaw,
} from "vue-router"

import Home from "./components/Home.vue"
import Game from "./components/Game.vue"
import Map from "./components/Map.vue"
import Noise from "./components/Noise.vue"

const routes: Array<RouteRecordRaw> = [{
    path: "/",
    name: "home",
    component: Home,
}, {
    path: "/game",
    name: "game",
    component: Game,
}, {
    path: "/map-editor",
    name: "map-editor",
    component: Map,
}, {
    path: "/noise-editor",
    name: "noise-editor",
    component: Noise,
}]

const router = createRouter({
    history: createWebHistory("/"),
    routes,
})

export default router
