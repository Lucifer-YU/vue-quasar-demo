<!-- 登录对话框 -->
<template>
  <q-modal v-model="logining" @close="modelClosed" enter-class="no-animate" leave-class="no-animate">
  <q-layout
    class="app-login-modal"
    ref="layout"
    view="lHh Lpr fff"
    v-if="logining"
  >
    <q-toolbar slot="header">
      <q-btn flat @click="logining = false">
        <q-icon name="keyboard_arrow_left" />
      </q-btn>
      <q-toolbar-title>
        Login
      </q-toolbar-title>
    </q-toolbar>
    <div class="login-panel">
      <iframe :src="externalLoginUrl"></iframe>
    </div>
  </q-layout>
  </q-modal>
</template>

<script>
import { QModal, QLayout, QToolbar, QToolbarTitle, QIcon, QBtn } from 'quasar'
import vouchersAuth from '../../services/vouchers-auth.service'

export default {
  name: 'LoginModal',
  components: {
    QModal, QLayout, QToolbar, QToolbarTitle, QIcon, QBtn
  },
  data: () => ({
    logining: false,
    externalLoginUrl: 'about:blank'
  }),
  watch: {
    logining (newVal) {
      console.log(`logining=${newVal}`)
      if (newVal) {
        // 打开登录界面, 监听登陆成功事件
        window.addEventListener('message', this.onMessageReceived, false)
        this.externalLoginUrl = this.generateLoginUrl('<Real userId>')
      }
      else {
        // 设置成空页面以节省开销, 取消登录事件监听
        window.removeEventListener('message', this.onMessageReceived)
        this.externalLoginUrl = 'about:blank'
      }
      console.log(`externalLoginUrl=${this.externalLoginUrl}`)
    }
  },
  mounted () {
    console.log(`login-modal mounted...`)
    // 监视登录请求事件
    this.loginHandler = vouchersAuth.loginRequest.subscribe(callback => {
      this.logining = true
      this.loginCallback = callback
    })
  },
  destroyed () {
    // 停止监视登录请求事件
    if (this.loginHandler) {
      this.loginHandler.unsubscribe()
      this.loginHandler = undefined
    }
    this.logining = false
  },
  methods: {
    generateLoginUrl (custId) {
      let url = window.location.href
      let sharpPos = url.indexOf('#')
      if (sharpPos >= 0) {
        url = url.substring(0, sharpPos)
      }
      let forwardUrl = encodeURIComponent(url + '#/loginCallback')
      let xml = encodeURIComponent(`<xml><custID>${custId}</custID></xml>`)
      let externalLoginUrl = `${process.env.API_BASE_URL}home?xml=${xml}&forward_url=${forwardUrl}`
      return externalLoginUrl
    },
    onMessageReceived (ev) {
      if (ev.type === 'message' && ev.data && ev.data.type === 'loginCallback') {
        // 只关心'登录回调'消息
        let msg = ev.data
        console.log(msg.userNo ? `login success with userNo: ${msg.userNo}` : `login failed with error: ${msg.error || 'unspecified'}`)

        this.msg = msg
        this.logining = false
      }
    },
    modelClosed () {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.loginCallback && this.msg) {
            this.loginCallback(this.msg.userNo, this.msg.error)
          }
        }, 500)
      })
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'
.app-login-modal
  position fixed
  top 0
  left 0
  right 0
  z-index 3000
  .layout-page
    display flex
    flex-flow column
    .login-panel
      background-color #ffffff
      display flex
      flex-flow column
      flex 1
      iframe
        flex 1
        border 0

</style>
