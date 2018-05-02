<template>
  <q-layout
    ref="layout"
    view="lHh Lpr fff"
    :left-class="{'bg-grey-2': true}"
  >
    <q-toolbar slot="header">
      <q-btn
        flat
        @click="$refs.layout.toggleLeft()"
      >
        <q-icon name="menu" />
      </q-btn>

      <q-toolbar-title>
        Quasar App
        <div slot="subtitle">Running on Quasar v{{$q.version}}</div>
      </q-toolbar-title>
    </q-toolbar>

    <div slot="left">
      <!--
        Use <q-side-link> component instead of <q-item> for internal vue-router navigation
      -->

      <q-list no-border link inset-delimiter>
        <q-list-header>Essential Links</q-list-header>
        <q-item @click="launch('https://gitter.im/quasarframework/Lobby')">
          <q-item-side icon="school" />
          <q-item-main label="个人中心" sublabel="待支付订单, 优惠券..." />
        </q-item>
        <q-side-link item to="/logout" exact>
          <q-item-side icon="record_voice_over" />
          <q-item-main label="退出登录" sublabel="退出当前用户" />
        </q-side-link>
      </q-list>
    </div>

    <!--
      Replace following <div> with <router-view /> component if using subRoutes
    -->
    <q-tabs position="bottom" class="tabbar__fullscreen">
      <!-- Tabs - notice slot="title" -->
      <q-tab default slot="title" name="tab-1" icon="message" label="首页" />
      <q-tab slot="title" name="tab-2" icon="account_box" label="活动" />
      <q-tab slot="title" name="tab-3" icon="fingerprint" label="个人中心" />
      <!-- Targets -->
      <q-tab-pane name="tab-1">
        <app-main-panel />
        </q-tab-pane>
      <q-tab-pane name="tab-2">
        <app-campaign-panel />
      </q-tab-pane>
      <q-tab-pane name="tab-3">
        <app-personal-panel />
        </q-tab-pane>
    </q-tabs>
  </q-layout>
</template>

<script>
import {
  openURL, QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QList, QListHeader, QItem, QItemSide, QItemMain, QSideLink, QTabs, QTab, QTabPane
} from 'quasar'
import AppMainPanel from './home/MainPanel'
import AppCampaignPanel from './home/CampaignPanel'
import AppPersonalPanel from './home/PersonalPanel'

export default {
  name: 'Home',
  components: {
    QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QList, QListHeader, QItem, QItemSide, QItemMain, QSideLink, QTabs, QTab, QTabPane,
    AppMainPanel,
    AppPersonalPanel,
    AppCampaignPanel
  },
  data () {
    return {
      totalCount: -1
    }
  },
  computed: {},
  methods: {
    launch (url) {
      openURL(url)
    }
  },
  mounted () {
  },
  beforeDestroy () {}
}
</script>
<style lang="stylus">
@import '~variables';

.layout-page
  display flex !important

// tabBar: 高度设置全屏
.tabbar__fullscreen
  width 100%
  height 'calc(100vh - %s)' % $toolbar-min-height
  .q-tabs-head
    position fixed
    z-index 2000
    left 0
    right 0
    bottom 0

  // 使内部的 .q-tab-pane 高度满屏
  .q-tabs-panes
    flex 1
    display flex
    flex-flow column
    
  .q-tab-label
    margin-top 6px !important

  .q-tab-pane
    display flex
    flex-flow column
    flex 1

// tabbar position: absolute; z-index:99999; left:0; right:0;bottom:-50px
</style>
