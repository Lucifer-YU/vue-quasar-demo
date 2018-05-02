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
      <q-card class="gallery-panel">
        <q-card-media>
          <app-carousel>
            <div v-for="(item, i) in gallery" :key="i"><img :src="item.imageUrl" /></div>
          </app-carousel>
        </q-card-media>
        <q-card-actions>
          <q-dialog-select @change="onSomethingChanged" v-model="categoryId" :options="categories" ok-label="确定" cancel-label="取消" title="选择分类" />
          <q-dialog-select @change="onSomethingChanged" v-model="sortBy" :options="sorts" ok-label="确定" cancel-label="取消" title="选择排序" />
        </q-card-actions>
      </q-card>

      <div class="list batches-panel" v-for="(item, i) in batches" :key="i">
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
import { QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMedia, QCardTitle, QCardSeparator, QCardActions, QDialogSelect, Alert } from 'quasar'
import AppCarousel from './widgets/Carousel.vue'
import vouchersApi from '../services/vouchers-api.service'
import appState from '../services/app-state.service'
import { RefresherContext } from '../utils/refresher-context'
import { FormatUtil } from '../utils/format.util'
import router from '../router'
export default {
  name: 'BatchList',
  data: () => ({
    categoryId: undefined,
    categories: [],
    sortBy: 0,
    sorts: [{ value: 0, label: '智能排序' }, { value: 1, label: '距离排序' }],
    gallery: [],
    batches: []
  }),
  components: {
    QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMedia, QCardTitle, QCardSeparator, QCardActions, QDialogSelect,
    AppCarousel
  },
  mounted () {
    console.log(`categoryId=${this.$route.params.categoryId}`)
    this.categoryId = Number(this.$route.params.categoryId)
    this.categories.push({ value: this.categoryId, label: '全部分类' })
    this.refresher()
  },
  methods: {
    goBack () {
      router.back()
    },
    refresher (done) {
      // 多个异步API调用共享同一个refresher, 当调用完成时通知UI.
      let ctx = new RefresherContext(done, (error) => {
        const alert = Alert.create({color: 'error', html: FormatUtil.error(error), icon: 'report_problem', position: 'right'})
        setTimeout((...args) => { alert.dismiss() }, 5000)
      })
      if (!this.gallery || !this.gallery.length) {
        // 加载画册
        ctx.add(vouchersApi.galleryList(this.categoryId)).subscribe(items => { this.gallery = items }, error => {
          console.error(FormatUtil.error(error))
        })
      }
      if (!this.categories || this.categories.length < 2) {
        // 加载分类列表
        ctx.add(vouchersApi.categoryList(this.categoryId)).subscribe(items => {
          this.categories = this.categories.slice(0, 1)
          items.forEach(item => {
            this.categories.push({ value: item.id, label: item.title })
          })
        }, error => {
          console.error(FormatUtil.error(error))
        })
      }
      // 加载批次信息
      ctx.add(vouchersApi.batchList(appState.city, this.categoryId, 0, 20, this.sortBy, appState.location.longitude, appState.location.latitude))
        .subscribe(results => {
          this.batches = results.items.map(item => {
            item.channel.imageUrl = undefined // (item.channel && item.channel.imageUrl) ? item.channel.imageUrl.split(',') : undefined
            let imageUrl = (item.channel.imageUrl && item.channel.imageUrl.length > 0) ? item.channel.imageUrl[0]
              : (item.imageUrls && item.imageUrls.length > 0) ? item.imageUrls[0] : ''
            console.log(`imageUrl=${item.channel.imageUrl}`)
            let price = (item.purchasePrice || '').replace('.00', '')
            return { id: item.id, tags: item.tags, imageUrl, title: item.title, price, payStartTime: item.payStartTime, payEndTime: item.payEndTime }
          })
        }, error => {
          console.error(FormatUtil.error(error))
        })
    },
    onSomethingChanged (_) {
      console.log(`onSomethingChanged(${_})`)
      this.refresher()
    },
    gotoDetail (batchId) {
      console.log(`gotoDetail(${batchId})`)
      let categoryId = Number(this.$route.params.categoryId)
      router.push({ path: `/categories/${categoryId}/batches/${batchId}` })
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.accent
  color $secondary

.app-batch-list
  background $neutral
  .layout-page
    display flex
    flex-flow column
    .pull-to-refresh
      flex 1
      display flex
      flex-flow column
      .pull-to-refresh-container
        flex 1
        margin-bottom -($tabs-min-height-with-icon)

  .q-card
    border-radius 0
  .q-card-title
    overflow hidden
    white-space nowrap
    text-overflow ellipsis

  .gallery-panel
    margin 0 0 8px 0
    background #ffffff
    .q-card-actions
      display flex
      padding 0 8px
      align-items center
      > div
        margin-top 8px
        flex 1
        padding 0 16px
      > div:last-child
        border-left $neutral solid 1px

  .q-carousel
    height 'calc(100vw * %s)' % 0.35
    max-height 200px
    .q-carousel-inner
      background #000000
      .q-carousel-track
        > div
          padding 0 1px 0 0
          width 80%
          max-width 80%
          height 100%
          overflow hidden
          > img
            object-fit cover
            height 100%
            width 100%
        > div:last-child
          padding 0

  .list
    border-radius: 2px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.2), 0 2px 2px rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12);
    display flex
    flex-flow column

  .batches-panel
    background: #ffffff
    > .list-cell
      display flex
      flex-flow row
      border-bottom solid 1px $neutral
      height 'calc(100vw * %s)' % 0.25
      min-height 100px
      max-height 140px
      padding 16px
      > div:first-child
        flex unset
        width 30%
        padding-right 16px
        > img
          object-fit cover
          width 100%
          height 100%
      > div:last-child
        flex 1
        position relative
        display flex
        flex-flow column
        align-content stretch
        > div:first-child
          font-size $subtitle-text-size
          font-weight 500
          text-overflow ellipsis
          overflow hidden
          max-height $subtitle-text-size * 2
          line-height $subtitle-text-size

        > div:last-child
          position absolute
          bottom 0
          right 0
          font-size $title-text-size
          font-weight 600
        > div:nth-child(2)
          padding-top 8px
</style>
