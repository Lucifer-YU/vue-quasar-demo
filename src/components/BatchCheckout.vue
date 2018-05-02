<template>
  <q-layout
    class="app-batch-order-confirm"
    ref="layout"
    view="lHh Lpr fff"
  >
    <app-login-modal />
    <q-toolbar slot="header">
      <q-btn flat @click="goBack()">
        <q-icon name="keyboard_arrow_left" />
      </q-btn>

      <q-toolbar-title>
        Quasar App
        <div slot="subtitle">Running on Quasar v{{$q.version}}</div>
      </q-toolbar-title>
    </q-toolbar>
    <q-btn big color="secondary" class="btn-submit" :disable="purchaseCount < 1" @click.stop="gotoOrder()">下单</q-btn>
    <q-pull-to-refresh ref="pullToRefresher" :handler="refresher" refresh-message="加载中..." pull-message="下拉加载" release-message="松开加载" :distance="0">
      <q-card class="intro-panel" v-if="batch">
        <q-card-main>
          <div><img :src="batch.imageUrl" /></div>
          <div>
            <div class="title">{{batch.title}}</div>
            <div class="subtitle">有效期至:<span class="accent">{{batch.endTime}}</span>&nbsp;&nbsp;已售:<span class="accent">{{batch.soldCount}}</span>张</div>
            <div class="subtitle">
              <span class="accent" v-for="(tagName, i) in batch.tags" :key="i">{{tagName}}&nbsp;&nbsp;</span>
            </div>
          </div>
        </q-card-main>
      </q-card>
      <div class="list" v-if="batch">
        <div class="list-cell">
          <div>数量</div>
          <div><app-stocker v-model="purchaseCount" /></div>
        </div>
        <div class="list-cell">
          <div>订单金额</div>
          <div class="accent">￥{{totalPrice}}</div>
        </div>
        <div class="list-cell">
          <div>支付金额</div>
          <div class="accent">￥{{discountedPrice}}</div>
        </div>
      </div>
      <div class="list" v-if="batch">
        <div class="list-cell">
          <div>支付方式</div>
          <div class="accent">工行借记卡</div>
        </div>
        <div class="list-cell" @click="setDiscountCode()">
          <div>优惠券</div>
          <div style="color: rgba(0,0,0,0.4);">{{discountCode || '未使用'}}&nbsp;<i class="q-icon material-icons big-icon">keyboard_arrow_right</i></div>
        </div>
        <div class="list-cell" v-if="contactFlag">
          <div>客户实名信息</div>
          <div style="color: rgba(0,0,0,0.4);">尚未填写&nbsp;<i class="q-icon material-icons big-icon">keyboard_arrow_right</i></div>
        </div>
      </div>
    </q-pull-to-refresh>
  </q-layout>
</template>

<script>
import { QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMain, QCardActions, QGalleryCarousel, Alert, Dialog, Loading } from 'quasar'
import AppStocker from './widgets/Stocker.vue'
import AppLoginModal from './login/LoginModal.vue'
import router from '../router'
import vouchersApi from '../services/vouchers-api.service'
import { RefresherContext } from '../utils/refresher-context'
import { FormatUtil } from '../utils/format.util'

export default {
  name: 'BatchCheckout',
  components: {
    QLayout, QToolbar, QToolbarTitle, QBtn, QIcon, QPullToRefresh, QCard, QCardMain, QCardActions, QGalleryCarousel,
    AppStocker, AppLoginModal
  },
  data: () => ({
    categoryId: undefined,
    batchId: undefined,
    batch: undefined,
    totalPrice: undefined,
    discountedPrice: undefined,
    contactFlag: undefined,
    batchDesc: '',
    purchaseCount: 1,
    discountCode: ''
  }),
  watch: {
    purchaseCount (newVal) {
      // Re-calculate again after purchase count changed.
      Loading.show()
      this.refresher(() => { Loading.hide() })
    }
  },
  mounted () {
    this.batchId = this.$route.params.batchId
    this.categoryId = Number(this.$route.params.categoryId)
    this.$refs.pullToRefresher.trigger()
  },
  destroyed () {
  },
  methods: {
    goBack () {
      router.back()
    },
    refresher (done) {
      let ctx = new RefresherContext(done, (error) => {
        const alert = Alert.create({color: 'error', html: FormatUtil.error(error), icon: 'report_problem', position: 'right'})
        setTimeout((...args) => { alert.dismiss() }, 5000)
      })
      ctx.add(vouchersApi.batchCalc(this.batchId, this.purchaseCount, this.discountCode))
        .subscribe(result => {
          console.log(`results=${JSON.stringify(result)}`)
          // 批次
          let item = result.items
          vouchersApi.pullHtmlDetail(item.desc).subscribe(content => { this.batchDesc = content })
          let startTime = FormatUtil.date(item.startTime)
          let endTime = FormatUtil.date(item.endTime)
          let imageUrl = item.imageUrls && item.imageUrls.length ? item.imageUrls[0] : ''
          this.batch = {
            id: item.id, tags: item.tags, imageUrl, title: item.title, startTime, endTime, soldCount: item.soldCount
          }
          // 其它
          this.contactFlag = item.contactFlag
          this.totalPrice = (result.totalPrice || '').replace('.00', '')
          this.discountedPrice = (result.discountedPrice || '').replace('.00', '')
        })
    },
    setDiscountCode () {
      let self = this
      Dialog.create({
        title: '请输入优惠码',
        form: {
          code: {
            type: 'text',
            model: this.discountCode
          }
        },
        buttons: [
          'Cancel',
          {
            label: 'Ok',
            handler: (data) => {
              console.log(`returns: ${JSON.stringify(data)}`)
              self.discountCode = data.code || ''

              // Re-calculate again after discount-code changed.
              Loading.show()
              self.refresher(() => { Loading.hide() })
            }
          }
        ]
      })
    },
    gotoOrder () {

    }
  }
}
</script>

<<style lang="stylus">
@import '~variables'

.accent
  color $secondary

.app-batch-order-confirm
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
        display flex
        flex-flow column
        margin-bottom -($tabs-min-height-with-icon)

  .title
    color #000000
    font-size $subtitle-text-size
    font-weight 500
    text-overflow ellipsis
    overflow hidden
    line-height 20px
    max-height 40px
    min-height 28px
    
  .subtitle
    color rgba(0,0,0,0.4)
    font-size $normal-text-size
    overflow hidden
    white-space nowrap
    text-overflow ellipsis

  // 简介card
  .intro-panel
    border-radius 0
    margin 0 0 8px 0
    background #ffffff
    .q-card-main
      height 'calc(100vw * %s)' % 0.33
      min-height 110px
      max-height 140px
      display flex
      flex-flow row
      position relative
      // 左侧图片栏
      > div:first-child
        width 33%
        min-width 75px
        img
          width 100%
          height 100%
          object-fit cover
      // 右侧文本栏
      > div:last-child
        padding-left 16px
        flex 1
        display flex
        flex-flow column
        overflow hidden
        > div:nth-child(2)
          flex 1

  // 通用列表class
  .list
    margin-bottom 8px
    border-radius 2px
    box-shadow 0 1px 5px rgba(0,0,0,0.2), 0 2px 2px rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12)
    background #ffffff
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

  .btn-submit
    position fixed
    z-index 99
    bottom 8px
    left 8px
    width 'calc(100vw - %s)' % 16px

</style>
