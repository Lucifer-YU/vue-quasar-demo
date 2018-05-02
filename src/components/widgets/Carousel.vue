<template>
  <div class="q-carousel" :style="computedStyle">
    <div class="q-carousel-inner" v-app-touch-pan="_pan">
      <div ref="track" class="q-carousel-track" :style="trackPosition">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import '../../utils/math-operators'
import { start, stop } from '../../utils/quasar/animate'
import { DomUtil } from '../../utils/dom.util'
import { decelerate, standard } from '../../utils/quasar/easing'
import AppTouchPan from '../../directives/TouchPan.vue'
export default {
  name: 'Carousel',
  directives: {
    AppTouchPan
  },
  props: {
    value: Number,
    height: String,
    noSwipe: Boolean,
    animation: {
      type: [Boolean],
      default: true
    }
  },
  provide () {
    return {
      carousel: this
    }
  },
  data: () => ({
    currentSlide: 0,
    totalSlide: 0,
    position: 0,
    toSlide: 0,
    slideItems: []
  }),
  watch: {
    value (newVal) {
      this.slideTo(newVal)
    }
  },
  computed: {
    hasPrevious () {
      return this.currentSlide > 0
    },
    hasNext () {
      return this.currentSlide < this.totalSlide
    },
    computedStyle () {
      if (this.height) {
        return `height: ${this.height}`
      }
    },
    trackPosition () {
      return DomUtil.cssTransform(`translateX(${this.position}px)`)
    },
    totalWidth () {
      let lastItem = this.slideItems.slice(-1)[0]
      return lastItem ? lastItem.left + lastItem.width : 0
    }
  },
  mounted () {
  },
  updated () {
    let track = this.$refs.track

    let childNodes = []
    track.childNodes.forEach(child => {
      if (child.clientWidth) {
        childNodes.push({
          left: child.offsetLeft, top: child.offsetTop,
          width: child.offsetWidth, height: child.offsetHeight
        })
      }
    })
    this.totalSlide = childNodes.length
    this.slideItems = childNodes
  },
  beforeDestroy () {
    this._cleanup()
  },
  methods: {
    previous () {
      return this.hasPrevious ? this.slideTo(this.currentSlide - 1) : Promise.resolve()
    },
    next () {
      return this.hasNext ? this.slideTo(this.currentSlide + 1) : Promise.resolve()
    },
    slideTo (slide, fromSwipe = false) {
      return new Promise((resolve, reject) => {
        let direction = '',
          pos

        this._cleanup()

        const finish = () => {
          this.$emit('input', this.currentSlide)
          this.$emit('slide-direction', direction)
          resolve()
        }

        if (this.totalSlide < 2) {
          this.currentSlide = 0
          this.toSlide = 0
          pos = 0
        }
        else {
          direction = slide > this.currentSlide ? 'next' : 'previous'

          this.currentSlide = Math.between(slide, 0, this.totalSlide - 1)
          this.toSlide = this.currentSlide
          pos = this.currentSlide
        }

        let currentItem = this.slideItems[pos]
        console.log(`pos=${pos}`)
        console.log(`this.slideItems=${this.slideItems.length}`)
        pos = -currentItem.left
        let maxOffset = Math.max(this.totalWidth, this.$refs.track.clientWidth) - this.$refs.track.clientWidth
        console.log(`pos=${pos}`)
        console.log(`maxOffset=${maxOffset}`)
        pos = Math.max(-maxOffset, pos)

        if (!this.animation) {
          this.position = pos
          finish()
          return
        }

        this.animationInProgress = true
        this.animUid = start({
          from: this.position,
          to: pos,
          duration: 300,
          easing: fromSwipe ? decelerate : standard,
          apply: pos => {
            this.position = pos
          },
          done: () => {
            this.animationInProgress = false
            finish()
          }
        })
      })
    },
    stopAnimation () {
      stop(this.animUid)
      this.animationInProgress = false
    },
    /**
     * touch pan事件回调函数
     */
    _pan (event) {
      if (event.isFirst) {
        this.initialPosition = this.position
        this._cleanup()
      }

      let delta = (event.direction === 'left' ? -1 : 1) * event.distance.x
      if ((this.currentSlide === 0 && delta > 0) || (this.currentSlide === this.totalSlide - 1 && delta < 0)) {
        delta = delta / 10 // 滑动到头了, 减速至1/10
      }
      this.position = this.initialPosition + delta
      this.toSlide = (event.direction === 'left' ? this.currentSlide + 1 : this.currentSlide - 1)

      if (event.isFinal) {
        let threshold = this.$refs.track.clientWidth / 5
        this.slideTo(event.distance.x < threshold ? this.currentSlide : this.toSlide, true).then(() => {
          delete this.initialPosition
        })
      }
    },
    _cleanup () {
      this.stopAnimation()
    }
  }
}
</script>

<style>

</style>
