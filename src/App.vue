<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <q-ajax-bar position="top" />
    <router-view />
  </div>
</template>

<script>
import { QAjaxBar } from 'quasar'

/*
 * Root component
 */
export default {
  components: {
    QAjaxBar
  }
}
</script>

<style lang="stylus">
@import '~variables';

// 左右淡出动画
@import '~quasar-extras/animate/bounceInLeft.css';
@import '~quasar-extras/animate/bounceInRight.css';

div
  font-size $normal-text-size
  -webkit-font-smoothing: antialiased;

.q-btn-standard
  font-size $normal-text-size

.q-btn-small
  font-size $small-text-size

div.modal-buttons
  button
    color $tertiary !important
  button:last-child
    color $primary !important

</style>
