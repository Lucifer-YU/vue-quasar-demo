<template>
  <div class="app-stocker">
    <q-btn small round icon="remove" color="secondary" @click="countReduce()" :disable="count <= 0" />
    <span>{{count}}</span>
    <q-btn small round icon="add" color="secondary" @click="countIncrease()" :disable="count >= 99" />
  </div>
</template>

<script>
import { QBtn } from 'quasar'
export default {
  name: 'Stocker',
  components: { QBtn },
  props: {
    value: Number
  },
  data: () => ({
    count: 0
  }),
  mounted () {
    this.count = this.value
  },
  methods: {
    countReduce () {
      if (this.count > 0) {
        this.count--
        this.$emit('input', this.count)
      }
    },
    countIncrease () {
      if (this.count < 999) {
        this.count++
        this.$emit('input', this.count)
      }
    }
  }
}
</script>

<style lang="stylus">

.app-stocker
  display flex
  align-items center
  > span
    min-width 40px
    text-align center
    flex 1
  > .q-btn
    width 28px
    height 28px
    > .q-btn-inner
      margin -2px 0
      overflow hidden
      width 22px !important
      max-width 22px !important
      > .q-icon
        font-size 18px !important

</style>
