import {
    createRouter,
    createWebHistory,
    RouteRecordRaw,
} from "vue-router"

import Home from "./components/Home.vue"
import Game from "./components/Game.vue"
import MapEditor from "./components/MapEditor.vue"

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
    component: MapEditor,
}]

const router = createRouter({
    history: createWebHistory("/"),
    routes,
})

export default router
