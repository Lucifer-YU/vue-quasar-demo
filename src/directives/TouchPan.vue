<script>
/**
 * TouchPan 指令将当前DOM element 当作触摸板, 捕获并分发在其之上的触摸事件.
 */

/**
 * 从事件中获取触摸坐标位置
 */
function position (evt) {
  evt = evt || window.event

  if (evt.touches && evt.touches[0]) {
    evt = evt.touches[0]
  }
  else if (evt.changedTouches && evt.changedTouches[0]) {
    evt = evt.changedTouches[0]
  }

  let posX, posY
  if (evt.clientX || evt.clientY) {
    posX = evt.clientX
    posY = evt.clientY
  }
  else if (evt.pageX || evt.pageY) {
    posX = evt.pageX - document.body.scrollLeft - document.documentElement.scrollLeft
    posY = evt.pageY - document.body.scrollTop - document.documentElement.scrollTop
  }
  else {
    let target = evt.target || evt.srcElement
    if (target.nodeType === 3) {
      target = target.parentNode // Safari bug
    }
    let offset = target.getBoundingClientRect()
    posX = ((offset.right - offset.left) / 2) + offset.left
    posY = ((offset.bottom - offset.top) / 2) + offset.top
  }

  return { left: posX, top: posY }
}
/**
 * 收集触摸事件变更信息
 */
function collectChanges (evt, ctx, isFinal) {
  let
    pos = position(evt),
    distX = pos.left - ctx.event.x,
    distY = pos.top - ctx.event.y,
    direction = distX < 0 ? 'left' : 'right' // 目前滑动事件只支持左右滑动

  return {
    evt,
    position: pos,
    direction,
    isFirst: ctx.event.isFirst,
    isFinal,
    duration: Date.now() - ctx.event.time,
    distance: {
      x: Math.abs(distX),
      y: Math.abs(distY)
    },
    delta: {
      x: pos.left - ctx.event.lastX,
      y: pos.top - ctx.event.lastY
    }
  }
}
/**
 * 是否触发滑动事件
 */
function shouldTrigger (ctx, changes) {
  return Math.abs(changes.delta.x) > 0
}

export default {
  name: 'TouchPan',
  bind (el, binding) {
    const supportMouse = !binding.modifiers.nomouse
    let ctx = {
      handler: binding.value,
      scroll: binding.modifiers.scroll,

      mouseStart (evt) {
        if (supportMouse) {
          document.addEventListener('mousemove', ctx.mouseMove)
          document.addEventListener('mouseup', ctx.mouseEnd)
        }
        ctx.start(evt)
      },
      mouseMove (evt) {
        ctx.event.prevent = true
        ctx.move(evt)
      },
      mouseEnd (evt) {
        if (supportMouse) {
          document.removeEventListener('mousemove', ctx.mouseMove)
          document.removeEventListener('mouseup', ctx.mouseEnd)
        }
        ctx.end()
      },
      start (evt) {
        const pos = position(evt)
        ctx.event = {
          x: pos.left,
          y: pos.top,
          time: Date.now(),
          prevent: false,
          detected: false,
          isFirst: true,
          lastX: pos.left,
          lastY: pos.top
        }
      },
      move (evt) {
        if (ctx.event.prevent) {
          if (!ctx.scroll) {
            evt.preventDefault()
          }
          let changes = collectChanges(evt, ctx, false)
          if (shouldTrigger(ctx, changes)) {
            ctx.handler(changes)
            ctx.event.lastX = changes.position.left
            ctx.event.lastY = changes.position.top
            ctx.event.isFirst = false
          }
          return
        }
        if (ctx.event.detected) {
          return
        }

        ctx.event.detected = true
        let
          pos = position(evt),
          distX = pos.left - ctx.event.x,
          distY = pos.top - ctx.event.y

        console.log(`avoid no-unused-vars: distX:${distX},distY:${distY}`)

        evt.preventDefault()
        ctx.event.prevent = true
      },
      end (evt) {
        if (!ctx.event.prevent || ctx.event.isFirst) {
          return
        }

        ctx.handler(collectChanges(evt, ctx, true))
      }
    }

    el._touchctx = ctx
    // TODO
    if (supportMouse) {
      el.addEventListener('mousedown', ctx.mouseStart)
    }
    el.addEventListener('touchstart', ctx.start)
    el.addEventListener('touchmove', ctx.move)
    el.addEventListener('touchend', ctx.end)
  },
  update (el, binding) {
    if (binding.oldValue !== binding.value) {
      el._touchctx.handler = binding.value
    }
  },
  unbind (el, binding) {
    let ctx = el._touchctx
    el.removeEventListener('touchstart', ctx.start)
    el.removeEventListener('mousedown', ctx.mouseStart)
    el.removeEventListener('touchmove', ctx.move)
    el.removeEventListener('touchend', ctx.end)
    delete el._touchctx
  }
}
</script>
