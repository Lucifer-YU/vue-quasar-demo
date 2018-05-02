<template>
  <q-pull-to-refresh class="app-main-panel" ref="pullToRefresher" :handler="refresher" refresh-message="加载中..." pull-message="下拉加载" release-message="松开加载" :distance="0">
    <div class="list">
      <div class="list-cell list-cell__search-bar">
        <q-search v-model="searchText" placeholder="输入商家、分类或商圈" />
        <q-dialog-select v-model="city" :options="cities" ok-label="确定" cancel-label="取消" title="选择城市" />
      </div>
      <div class="list-cell list-cell__gallery">
        <app-gallery-carousel :src="gallery" infinite autoplay dots arrows @click="goOpenGallery" />
      </div>
      <div class="list-cell list-cell__guide-line"  @click="goOpenGuide()">
        <div><q-icon name="subtitles" size="20px" /></div>
        <div>金券攻略</div>
        <div><app-flowing-text v-model="flowingText" /></div>
        <div><q-icon name="chevron_right" size="20px" /></div>
      </div>
      <div class="list-cell list-cell__sub-categories">
        <div @click="gotoCategory(5)">
          <img src="statics/ic_home_food.png" />
          <span>美食</span>
        </div>
        <div @click="gotoCategory(6)">
          <img src="statics/ic_home_skiing.png" />
          <span>温泉滑雪</span>
        </div>
        <div @click="gotoCategory(7)">
          <img src="statics/ic_home_discovery.png" />
          <span>推荐</span>
        </div>
      </div>
      <div class="list-cell list-cell__batches" v-for="(item, i) in batches" :key="i" @click="gotoDetail(item.id)">
        <div>
          <div>
            <img v-bind:src="item.imageUrl" />
            <img class="overlay" src="statics/cv_home_serrated.png" />
            <label>{{item.timeLeft}}</label>
          </div>
          <div>
            <div>￥{{item.price}}</div>
            <div>{{item.title}}</div>
            <div><q-btn small color="secondary" @click.stop="gotoOrder(item.id)">立即抢购</q-btn></div>
          </div>
        </div>
      </div>
    </div>
  </q-pull-to-refresh>
</template>
<script>
import { QToolbar, QToolbarTitle, QBtn, QIcon, QSearch, QDialogSelect, QCarousel, QPullToRefresh, Dialog, Alert } from 'quasar'
import AppGalleryCarousel from '../widgets/GalleryCarousel'
import AppFlowingText from '../widgets/FlowingText'
import { Observable } from 'rxjs'
import vouchersApi from '../../services/vouchers-api.service'
import appState from '../../services/app-state.service'
import { RefresherContext } from '../../utils/refresher-context'
import { FormatUtil } from '../../utils/format.util'
import router from '../../router'

export default {
  name: 'MainPanel',
  components: {
    QToolbar, QToolbarTitle, QBtn, QIcon, QSearch, QDialogSelect, QCarousel, QPullToRefresh,
    AppGalleryCarousel, AppFlowingText
  },
  data: () => ({
    searchText: '',
    city: appState.city,
    cities: [],
    gallery: [
      'statics/bnn_0.png',
      'statics/bnn_1.png'
    ],
    flowingText: [ '在北京没吃过这些，不算合格的吃货!', '你能想到的台湾夜市小吃，小明同学通通都有！', '花钱买苦吃？聊聊越苦越畅销的精酿啤酒!' ],
    batches: []
  }),
  watch: {
    city (newVal) {
      appState.city = newVal
    }
  },
  mounted () {
    this.$refs.pullToRefresher.trigger()
    // 开始监听应用状态(城市,经纬度)变更事件
    this._appStateHandler = appState.on(appState.EV_CITY_CHANGED, appState.EV_LOCATION_CHANGED)
      .subscribe(event => {
        console.log(`city or location changed to ${JSON.stringify(event.args)}`)
        this.city = appState.city
        // 加载页面数据
        this.refresher()
      })
    // 定期刷新停售倒计时
    this._timerHandler = Observable.interval(30 * 1000).subscribe(time => {
      // console.log(`updating time-left...`)
      this.updateTimeLeft()
    })
  },
  destroyed () {
    // 停止监听应用状态变更事件
    if (this._appStateHandler) {
      this._appStateHandler.unsubscribe()
    }
    // 停止定时器
    if (this._timerHandler) {
      this._timerHandler.unsubscribe()
    }
  },
  methods: {
    refresher (done) {
      // 多个异步API调用共享同一个refresher, 当调用完成时通知UI.
      let ctx = new RefresherContext(done, (error) => {
        const alert = Alert.create({color: 'error', html: FormatUtil.error(error), icon: 'report_problem', position: 'right', enter: 'bounceInRight', leave: 'bounceOutLeft'})
        setTimeout((...args) => { alert.dismiss() }, 5000)
      })
      // 城市列表
      if (!this.cities || !this.cities.length) {
        ctx.add(vouchersApi.cityList())
          .subscribe(results => {
            this.cities = []
            results.forEach((item, i) => {
              if (i < 100) { // 城市可能非常多, 不做个限制手机端会很卡.
                this.cities.push({ label: item, value: item })
              }
            })
          })
      }
      // 批次列表
      ctx.add(vouchersApi.batchList(appState.city, undefined, 0, 20, 0, appState.location.longitude, appState.location.latitude))
        .subscribe(results => {
          this.totalCount = results.totalCount
          this.batches = []
          results.items.forEach(item => {
            // 将API收到的数据转换成页面上显示的视图模型
            let imageUrl = (item.imageUrls && item.imageUrls.length) ? item.imageUrls[0] : ''
            let price = (item.purchasePrice || '').replace('.00', '')
            this.batches.push({
              id: item.id, tags: item.tags, imageUrl, title: item.title, price, timeLeft: '',
              payStartTime: item.payStartTime, payEndTime: item.payEndTime
            })
          })
          this.updateTimeLeft()
        })
    },
    updateTimeLeft () {
      let now = Date.now()
      this.batches.forEach(item => {
        item.timeLeft = FormatUtil.timeLeft(item.payEndTime, now)
      })
    },
    gotoDetail (batchId) {
      console.log(`gotoDetail(${batchId})`)
      router.push({ path: `/batches/${batchId}` })
    },
    gotoOrder (batchId) {
      console.log(`gotoOrder(${batchId})`)
      router.push({ path: `/batches/${batchId}/checkout` })
    },
    gotoCategory (categoryId) {
      console.log(`gotoCategory(${categoryId})`)
      router.push({ path: `categories/${categoryId}/batches` })
    },
    goOpenGallery (itemIndex) {
      console.log(`goOpenGallery(itemIndex:${itemIndex})`)
      Dialog.create({
        title: '消息',
        message: '福袋入口未生效!'
      })
    },
    goOpenGuide () {
      Dialog.create({
        title: '消息',
        message: '金券攻略未生效!'
      })
    }
  }
}
</script>
<style>

</style>

<style lang="stylus">
@import '~variables'
$bars-height = $toolbar-min-height + $tabs-min-height-with-icon

body.with-modal
  padding-right 0 !important  // IE弹出对话框会在body设置'padding-right: 17px;', 这里并不希望这样做.


// 使内部的 .pull-to-refresh-container 高度满屏
.pull-to-refresh.app-main-panel
  background $neutral
  display flex
  flex-flow column
  flex 1
  .pull-to-refresh-container
    flex 1
    margin-bottom $tabs-min-height-with-icon

.list
  background: #ffffff
  display flex
  flex-flow column
  > .list-cell
    display flex
    flex-flow row
    border-bottom rgba(0, 0, 0, .12) solid 1px

.list-cell__search-bar
  border-bottom none
  min-height $toolbar-min-height
  > div
    margin-top 10px
    margin-bottom 6px
    white-space nowrap  // IE
    justify-content center // IE
  > div:first-child
    flex 1
  > div:last-child
    min-width 75px  // IE

.list-cell__gallery
  border-bottom none
  height 'calc(100vw * %s)' % 0.35
  min-height $slider-min-height
  max-height 200px
  .q-carousel
    width: 100%
    img
      width: 100%

.list-cell__guide-line
  padding 10px !important
  flex-wrap nowrap
  justify-content center
  > div:first-child, > div:last-child
    padding 0 2px
    .q-icon
      color $primary
  > div:nth-child(2)
    padding 0 10px
    white-space: nowrap
    color #000000
    font-weight bold
  > div:nth-child(3)
    padding 0 2px
    flex-grow 1
    overflow hidden
    white-space nowrap
    text-overflow ellipsis
    color $tertiary

.list-cell__sub-categories
  padding 10px !important
  > div
    width 33%
    display flex
    flex-flow column
    align-items center
    > img
      width 50%
      object-fit cover
      border-radius 50%
    > span
      padding 5px
      font-weight 400

.list-cell__batches
  background $neutral
  border-bottom 0 !important
  > div
    margin 10px
    width 100%
    display flex
    border-radius 5px
    overflow hidden
    position relative
    flex-flow column !important
    > div:first-child
      margin-bottom -5px  // 奇怪, 下面多出4像素
      > img
        width 100%
        height 'calc(100vw * %s)' % 0.35
        max-height 200px
        object-fit cover
      > img.overlay
        position absolute
        top 0
        right 0
        bottom 0
        left 0
        object-fit fill
        z-index 1
      > label
        position absolute
        color white
        background rgba(0, 0, 0, 0.5)
        padding 1px 8px
        right 10px
        bottom 75px
    > div:last-child
      display flex
      background white
      justify-content center
      align-items center
      > div
        padding 0 8px 16px 8px
      > div:first-child
        font-size $subtitle-text-size
        line-height 24px
        font-weight 500
      > div:nth-child(2)
        line-height 24px
        flex-grow 1
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
      > div:last-child
        > .q-btn-small
          padding 0 8px
          min-width 70px
          line-height 24px

</style>
