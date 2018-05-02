<template>
      <q-layout
    class="app-batch-list"
    ref="layout"
    view="lHh Lpr fff"
  >
    <q-toolbar slot="header">
      <q-btn flat @click="goBack()">
        <q-icon name="keyboard_arrow_left" />
      </q-btn>

      <q-toolbar-title>
        Quasar App
        <div slot="subtitle">Running on Quasar v{{$q.version}}</div>
      </q-toolbar-title>
    </q-toolbar>

    <q-pull-to-refresh class="full-width" ref="pullToRefresher" :handler="refresher" refresh-message="加载中..." pull-message="下拉加载" release-message="松开加载" :distance="0">
      <div class="list batch-pois-panel" v-for="(item, i) in stores" :key="i">
        <div class="list-cell" @click="gotoDetail(item.id)">
          <div><img :src="item.imageUrl" /></div>
          <div>
            <div>{{item.title}}</div>
            <div>
              <span class="accent" v-for="(tagName, i) in item.tags" :key="i">{{tagName}}&nbsp;&nbsp;</span>
            </div>
            <div class="accent"><span style="font-size: 12px;color:#7f7f7f;text-decoration: line-through;">￥1000</span><br/><span style="font-size: 12px">￥</span>{{item.price}}</div>
          </div>
        </div>
      </div>
    </q-pull-to-refresh>
  </q-layout>
</template>

<script>
import { QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMedia, QCardTitle, QCardActions, QGalleryCarousel } from 'quasar'

export default {
  name: 'BatchPoiList',
  components: {
    QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMedia, QCardTitle, QCardActions, QGalleryCarousel
  },
  data: () => ({
    stores: []
  }),
  methods: {
    refresher (done) {
    }
  }
}
</script>

<style>

</style>
