<template>
  <q-carousel
    ref="slider"
    @slide="_updateCurrentSlide"
    :dots="dots"
    :arrows="arrows"
    :fullscreen="fullscreen"
    :infinite="infinite"
    actions
    :animation="animation"
    :autoplay="autoplay"
    :handle-arrow-keys="handleArrowKeys"
    :easing="easing"
    :swipe-easing="swipeEasing"
    :no-swipe="noSwipe"
    class="text-white bg-black app-album-carousel"
  >
    <div
      v-for="(img, i) in src"
      :key="i"
      slot="slide"
      class="no-padding row flex-center"
    >
      <div class="full-width">
        <img :src="img" @click="_clickItem(i)" />
      </div>
    </div>

  </q-carousel>

</template>

<script>
import { QCarousel, QIcon } from 'quasar'

let QCarouselMixin = {
  props: {
    arrows: Boolean,
    dots: Boolean,
    fullscreen: Boolean,
    infinite: Boolean,
    actions: Boolean,
    animation: {
      type: [Number, Boolean],
      default: true
    },
    easing: Function,
    swipeEasing: Function,
    noSwipe: Boolean,
    handleArrowKeys: Boolean,
    autoplay: [Number, Boolean]
  }
}

export default {
  name: 'AlbumCarousel',
  components: {
    QCarousel, QIcon
  },
  mixins: [
    QCarouselMixin
  ],
  props: {
    src: {
      type: Array,
      required: true
    },
    arrows: {
      type: Boolean,
      default: true
    },
    actions: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    currentSlide: 0
  }),
  methods: {
    _updateCurrentSlide (value) {
      this.currentSlide = value
      this.$emit('slide', value)
    },
    _clickItem (index) {
      this.$emit('click', index)
    }
  }
}
</script>

<style lang="stylus">
.app-album-carousel
  img
    height auto
    width 100%
    display block

</style>
