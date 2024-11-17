import {
    createRouter,
    createWebHistory,
    RouteRecordRaw,
} from "vue-router"

import Home from "./components/Home.vue"
import Tilesets from "./components/Tilesets.vue"
import Map from "./components/Map"
import Noise from "./components/Noise.vue"

const routes: Array<RouteRecordRaw> = [{
    path: "/",
    name: "home",
    component: Home,
}, {
    path: "/map-editor",
    name: "map-editor",
    component: Map,
}, {
    path: "/tilesets",
    name: "tilesets",
    component: Tilesets,
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
