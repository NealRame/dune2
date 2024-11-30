import {
    createRouter,
    createWebHistory,
    RouteRecordRaw,
} from "vue-router"

import Home from "./components/Home.vue"
import Tilesets from "./components/Tilesets.vue"
import Game from "./components/Game"
import Map from "./components/Map"

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
    path: "/tilesets",
    name: "tilesets",
    component: Tilesets,
}]

const router = createRouter({
    history: createWebHistory("/"),
    routes,
})

export default router
