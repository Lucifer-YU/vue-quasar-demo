import Vue from 'vue'
import VueRouter from 'vue-router'
import AppHome from './components/Home'
import AppBatchDetail from './components/BatchDetail'
import AppBatchList from './components/BatchList'
import AppBatchCheckout from './components/BatchCheckout'
import AppBatchPoiList from './components/BatchPoiList'

import AppLoginCallback from './components/login/LoginCallback'

import AppError404 from './components/Error404'

Vue.use(VueRouter)

/* lazy loading
function load (component) {
  // '@' is aliased to src/components
  return () => import(`@/${component}.vue`)
}
*/

export default new VueRouter({
  /*
   * NOTE! VueRouter "history" mode DOESN'T works for Cordova builds,
   * it is only to be used only for websites.
   *
   * If you decide to go with "history" mode, please also open /config/index.js
   * and set "build.publicPath" to something other than an empty string.
   * Example: '/' instead of current ''
   *
   * If switching back to default "hash" mode, don't forget to set the
   * build publicPath back to '' so Cordova builds work again.
   */

  mode: 'hash',
  scrollBehavior: (to, from, savedPosition) => ({ y: 0 }),

  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: AppHome },
    { path: '/categories/:categoryId?/batches', component: AppBatchList },
    { path: '/batches/:batchId', component: AppBatchDetail },
    { path: '/categories/:categoryId?/batches/:batchId', component: AppBatchDetail },
    { path: '/batches/:batchId/checkout', component: AppBatchCheckout },
    { path: '/categories/:categoryId?/batches/:batchId/checkout', component: AppBatchCheckout },
    { path: '/batches/:batchId/pois', component: AppBatchPoiList },
    { path: '/categories/:categoryId?/batches/:batchId/pois', component: AppBatchPoiList },

    { path: '/loginCallback', component: AppLoginCallback },

    // Always leave this last one
    { path: '*', component: AppError404 } // Not found
  ]

  /* lazy loading
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', component: load('Home') },
    { path: '/batches/:batchId', component: load('BatchDetail') },
    { path: '/categories/:categoryId/batches', component: load('BatchList') },
    { path: '/categories/:categoryId/batches/:batchId', component: load('BatchDetail') },
    // Always leave this last one
    { path: '*', component: load('Error404') } // Not found
  ]
  */
})
