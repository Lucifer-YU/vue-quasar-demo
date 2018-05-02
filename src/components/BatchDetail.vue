<template>
  <q-layout
    class="app-batch-detail"
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
    <q-btn big color="secondary" class="btn-submit" @click.stop="gotoOrder()">立即购买</q-btn>
    <q-pull-to-refresh ref="pullToRefresher" :handler="refresher" refresh-message="加载中..." pull-message="下拉加载" release-message="松开加载" :distance="0">
      <div style="padding: 8px; text-align: center; height: 200px;" v-if="!batch">No data available, pull down to refresh...</div>
      <!-- 顶部card -->
      <q-card class="intro-panel" v-if="batch">
        <q-card-media>
          <q-gallery-carousel infinite autoplay dots :src="batch.imageUrls" />
        </q-card-media>
        <q-card-title>
          {{batch.title}}
          <div slot="subtitle">
            有效期至:<span class="accent">{{batch.endTime}}</span>&nbsp;&nbsp;已售:<span class="accent">{{batch.soldCount}}</span>张
          </div>
          <div slot="subtitle" class="subtitle__end">
            <div>
              <span class="accent" v-for="(tagName, i) in batch.tags" :key="i">{{tagName}}&nbsp;&nbsp;</span>
            </div>
            <div>
              <q-btn small color="secondary">商家介绍</q-btn>
            </div>
          </div>
        </q-card-title>
      </q-card>
      <!-- 详情 -->
      <div class="list detail-panel" v-if="batch">
        <div class="list-cell">
          <div>单价</div>
          <div class="accent">￥{{batch.price}}</div>
        </div>
        <div class="list-cell">
          <div>支付方式</div>
          <div class="accent">工行借记卡</div>
        </div>
        <div class="list-cell">
          <div>适用门店&nbsp;<span class="subtitle">(离我最近)</span></div>
        </div>
        <div class="list-cell" v-if="store">
          <div>{{store.title}}<br/><span class="subtitle">{{store.address}}</span></div>
        </div>
        <div class="list-cell" v-if="storeCount" @click="gotoStoreList()">
          <div>全部门店信息</div>
          <div style="color: rgba(0,0,0,0.4);">共{{storeCount}}家&nbsp;<i class="q-icon material-icons big-icon">keyboard_arrow_right</i></div>
        </div>
        <div class="list-cell">
          <div>优惠细则<br/><span class="subtitle" v-html="batchDesc"></span></div>
        </div>
      </div>
    </q-pull-to-refresh>
  </q-layout>
</template>
<script>
import { QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMedia, QCardTitle, QCardActions, QGalleryCarousel, Alert } from 'quasar'
import router from '../router'
import vouchersApi from '../services/vouchers-api.service'
import appState from '../services/app-state.service'
import { RefresherContext } from '../utils/refresher-context'
import { FormatUtil } from '../utils/format.util'

export default {
  name: 'BatchDetail',
  components: {
    QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMedia, QCardTitle, QCardActions, QGalleryCarousel
  },
  data: () => ({
    categoryId: undefined,
    batchId: undefined,
    batch: undefined,
    batchDesc: '',
    store: undefined,
    storeCount: 0,
    _appStateHandler: undefined
  }),
  mounted () {
    this.batchId = this.$route.params.batchId
    this.categoryId = Number(this.$route.params.categoryId)
    this.$refs.pullToRefresher.trigger()
    // 开始监听应用状态(城市,经纬度)变更事件
    this._appStateHandler = appState.on(appState.EV_CITY_CHANGED, appState.EV_LOCATION_CHANGED)
      .subscribe(event => {
        console.log(`city or location changed to ${JSON.stringify(event.args)}`)
        this.city = appState.city
        // 加载页面数据
        this.refresher()
      })
  },
  destroyed () {
    // 停止监听应用状态变更事件
    this._appStateHandler.unsubscribe()
  },
  methods: {
    goBack () {
      router.back()
    },
    gotoOrder () {
      let pathPrefix = this.categoryId ? `/categories/${this.categoryId}` : ''
      router.push({ path: pathPrefix + `/batches/${this.batchId}/checkout` })
    },
    gotoStoreList () {
      let pathPrefix = this.categoryId ? `/categories/${this.categoryId}` : ''
      router.push({ path: pathPrefix + `/batches/${this.batchId}/pois` })
    },
    refresher (done) {
      let ctx = new RefresherContext(done, (error) => {
        const alert = Alert.create({color: 'error', html: FormatUtil.error(error), icon: 'report_problem', position: 'right'})
        setTimeout((...args) => { alert.dismiss() }, 5000)
      })
      ctx.add(vouchersApi.batchDetail(this.batchId, appState.city, appState.location.longitude, appState.location.latitude))
        .subscribe(item => {
          // 批次
          vouchersApi.pullHtmlDetail(item.desc).subscribe(content => { this.batchDesc = content })
          let price = (item.purchasePrice || '').replace('.00', '')
          let startTime = FormatUtil.date(item.startTime)
          let endTime = FormatUtil.date(item.endTime)
          this.batch = {
            id: item.id, tags: item.tags, imageUrls: item.imageUrls, title: item.title, price, startTime, endTime, soldCount: item.soldCount
          }
          // 门店
          if (item.channel && item.channel.locations) {
            this.storeCount = item.channel.locations.totalCount
            if (item.channel.locations.items) {
              let location = item.channel.locations.items[0]
              this.store = {
                id: location.id, title: location.title, address: location.address, phone: location.phone, longitude: location.lng, latitude: location.lat
              }
            }
          }
          else {
            this.storeCount = 0
            this.store = undefined
          }
        })
    }
  }
}
</script>
<<style lang="stylus">
@import '~variables'

.layout
  background $neutral

.pull-to-refresh
  max-height unset
  width: 100%

.big-icon
  font-size: 20px

.accent
  color $secondary
.subtitle
  color rgba(0,0,0,0.4)
  font-size $normal-text-size
  p
    font-size $normal-text-size

.app-batch-detail
  .btn-submit
    position fixed
    z-index 99
    bottom 8px
    left 8px
    width 'calc(100vw - %s)' % 16px

  .q-card
    border-radius 0
  .q-card-title
    overflow hidden
    white-space nowrap
    text-overflow ellipsis
  .q-card-primary
    background #ffffff
  .list
    border-radius: 2px;
    box-shadow: 0 1px 5px rgba(0,0,0,0.2), 0 2px 2px rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12);
    background: #ffffff
    display flex
    flex-flow column
    .list-cell
      display flex
      flex-flow row
      border-bottom solid 1px $neutral
      padding 16px
      > div
        flex 1
      > :last-child
        flex unset

  .intro-panel
    margin 0 0 8px 0
    .q-card-media
      height 'calc(100vw * %s)' % 0.35
      min-height $slider-min-height
      max-height 200px
      .q-carousel
        height 100%
    .q-card-primary
      overflow hidden
      white-space nowrap
      text-overflow ellipsis
      .subtitle__end
        margin-top 16px
        display flex
        flex-flow row
        align-items center
        > :first-child
          flex 1
          line-height 28px

  .detail-panel
    > .list-cell
      align-items center
      > div
        font-size $subtitle-text-size
        font-weight 500
      > div:nth-child(2)
        flex unset
        font-size $normal-text-size
        font-weight 400

</style>
