<template>
  <div class="app-flowing-text">
    &nbsp;
    <div ref="track" class="app-flowing-track" :style="trackPosition">
      <div v-for="(text, i) in texts" :key="i">{{text}}</div>
    </div>
  </div>
</template>

<script>
import { start } from '../../utils/quasar/animate'
import { standard } from '../../utils/quasar/easing'
import { DomUtil } from '../../utils/dom.util'
export default {
  name: 'FlowingText',
  props: {
    value: {
      type: Array || String, // 可以接受字符串或者数组作为参数
      default: () => []
    },
    interval: {
      type: Number,
      default: 3000
    }
  },
  data: () => ({
    items: [],
    index: -1,
    position: 0
  }),
  computed: {
    texts () {
      // 文本列表. 为了实现无缝平滑滚动, 把第一行复制到最后一行.
      let texts = Array.isArray(this.value) ? this.value : [ this.value ]
      if (texts.length) {
        texts.push(texts[0])
      }
      return texts
    },
    trackPosition () {
      // 计算滑动位置
      return DomUtil.cssTransform(`translateY(${this.position}px)`)
    }
  },
  mounted () {
    this._recalcLayout()
  },
  beforeDestroy () {
    this._cleanup()
  },
  methods: {
    _planAutoPlay () {
      // 牵涉到布局变化, 所以将操作丢到下一个runloop.
      this.$nextTick(() => {
        clearTimeout(this.timer)
        this.timer = setTimeout(
          args => { this.next() },
          this.interval)
      })
    },
    _cleanup () {
      clearTimeout(this.timer)
      this.stopAnimation()
    },
    _recalcLayout () {
      // 重新计算布局
      let track = this.$refs.track
      if (!track) return

      let items = []
      track.childNodes.forEach((child, i) => {
        items.push({ top: child.offsetTop, height: child.offsetHeight })
      })
      this.items = items
      this.index = items.length ? 0 : -1

      this._planAutoPlay()
    },
    next () {
      // 空列表, 啥都不做了
      if (this.index < 0) return

      this.index = (this.index + 1) % this.items.length
      if (!this.index) {
        // 头尾瞬间切换
        this.position = 0
        this.next()
        return
      }
      // 计算滑动位置
      let item = this.items[this.index]
      let pos = -item.top
      // 开始滑动动画
      this.animationInProgress = true
      this.animUid = start({
        from: this.position,
        to: pos,
        duration: (this.interval / 5),
        easing: standard,
        apply: pos => {
          this.position = pos
        },
        done: () => {
          // 动画结束, 准备下一次的滑动
          this.animationInProgress = false
          this._planAutoPlay()
        }
      })
    },
    stopAnimation () {
      stop(this.animUid)
      this.animationInProgress = false
    }
  }
}
</script>

<style lang="stylus">
.app-flowing-text
  width 100%
  overflow hidden
  position relative
  > .app-flowing-track
    position absolute
    width 100%
    max-width 100%
    left 0
    top 0
    > div
      overflow hidden
      white-space nowrap
      text-overflow ellipsis


</style>
