<template>
  <q-layout
    class="app-login-callback"
    ref="layout"
    view="lHh Lpr fff"
  >
  <div class="q-card">
    <div class="q-card-title">
      {{title}}
    </div>
    <div v-if="error" class="card-error">
      {{error}}
    </div>
    <div class="q-card-actions">
      <q-btn color="secondary" @click="onClose()">{{desc}}</q-btn>
    </div>
  </div>
  </q-layout>
</template>

<script>
import { QLayout, QBtn } from 'quasar'
export default {
  name: 'LoginCallback',
  components: {
    QLayout, QBtn
  },
  data: () => ({
    title: '',
    desc: '',
    userNo: undefined,
    error: undefined
  }),
  mounted () {
    this.userNo = this.$route.query['user_no']
    this.error = this.$route.query['error']
    console.log(`userNo=${this.userNo},error=${this.error}`)

    this.title = this.error ? 'Login failed' : 'Login success'
    this.desc = `Page closing after 5 seconds.`

    // 如果是内联框架中(e.g; frameset, iframe), 需要发送事件告诉父框架登陆成功.
    if (!window.parent) {
    }
    let countDown = 3
    let timeoutHandler = () => {
      if (!countDown--) {
        this.onClose()
      }
      else {
        this.desc = `Page closing after ${countDown} seconds.`
        setTimeout(timeoutHandler, 1000)
      }
    }
    timeoutHandler()
  },
  methods: {
    onClose () {
      console.log(`postMessage: loginCallback`)
      window.parent.postMessage({ type: 'loginCallback', error: this.error, userNo: this.userNo }, '*')
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'
.app-login-callback
  display flex
  flex-flow column
  background $neutral
  .layout-page
    display flex
    flex-flow column
    flex 1
    justify-content center
    .q-card
      background #ffffff
      > div
        text-align center
      > div:not(:first-child)
        border-top solid 1px #e0e0e0
      > .q-card-title
        padding 8px 8px
      > .q-card-actions
        padding 32px 8px
        > button
          width 80%

</style>
