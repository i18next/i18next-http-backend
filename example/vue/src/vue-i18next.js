// this could be an external npm module...

import { h } from 'vue'

function parseValue(value) {
  if (typeof value === 'string') {
    return { key: value }
  } else if (typeof value === 'object') {
    if (!value.key && value.path) {
      value.key = value.path
      delete value.path
    }
    if (!value.key) {
      throw new Error('no key in value')
    }
    return value
  } else {
    throw new Error()
  }
}

function getInterpolateArg(
  { slots },
  keys
) {
  if (keys.length === 1 && keys[0] === 'default') {
    // default slot only
    return slots.default ? slots.default() : []
  } else {
    // named slots
    return keys.reduce((arg, key) => {
      const slot = slots[key]
      if (slot) {
        arg[key] = slot()
      }
      return arg
    }, {})
  }
}

export const createI18n = (i18next) => ({
  install: (app, options = {}) => {
    options.bindI18n = options.bindI18n || 'languageChanged loaded'
    options.bindStore = options.bindStore || 'added removed'

    // add some reactivity...
    app.mixin({
      created() {
        if (options.bindI18n) {
          i18next.on(options.bindI18n, () => this.$forceUpdate())
        }
        if (options.bindStore && i18next.store) {
          i18next.store.on(options.bindStore, () => this.$forceUpdate())
        }
      }
    })

    // install globalProperties
    app.config.globalProperties.$i18n = i18next
    app.config.globalProperties.$t = (...args) => i18next.t.apply(i18next, args)

    // install directive
    const bind = (el, { value }) => {
      const parsedValue = parseValue(value)
      el.textContent = i18next.t(parsedValue.key, parsedValue)
    }
    app.directive('t', {
      beforeMount: bind,
      beforeUpdate: bind
    })

    // install component
    app.component('TransComponent', { // Try to make this as similar as possible to: https://react.i18next.com/latest/trans-component
      props: {
        tag: {
          type: String,
          default: 'span'
        },
        i18nKey: {
          type: String,
          required: true
        },
        options: {
          type: Object
        }
      },
      setup(props, context) {
        return () => {
          const { slots, attrs } = context
          const keys = Object.keys(slots).filter(key => key !== '_')
          const children = getInterpolateArg(context, keys)
          const key = props.i18nKey
          const tag = props.tag
          const i18nextOptions = {
            ...(props.options || {}),
            interpolation: { prefix: '#$?', suffix: '?$#' }
          }

          let translationValue = i18next.t(key, i18nextOptions)

          const childrenOrderMatch = translationValue.match(/<\s*[0-9]+?/g)
          let childrenOrder = []
          if (childrenOrderMatch) {
            childrenOrder = childrenOrderMatch.map((m) => parseInt(m.replace('<', '')))
          }

          const newtChildren = []
          childrenOrder.forEach((i) => {
            const openTag = `<${i}>`
            const firstInd = translationValue.indexOf(openTag)
            const selfClosingTag = `<${i}/>`
            const selfClosingInd = translationValue.indexOf(selfClosingTag)
            if (firstInd > -1) {
              const firstChild = translationValue.substring(0, firstInd)
              if (firstChild) {
                newtChildren.push(firstChild)
              }

              const closeTag = `</${i}>`
              const secondInd = translationValue.indexOf(closeTag)
              if (secondInd > 0) {
                const splitted = translationValue.split(new RegExp(`<${i}[^>]*>(.*?)</${i}>`, 'g'))
                if (splitted.length > 2 && children[i]) {
                  children[i].children = splitted[1]
                  children[i].shapeFlag = 9 // this way also self-closing elements are transformed to have children
                }
                newtChildren.push(children[i])
                translationValue = translationValue.substring(secondInd + closeTag.length)
              }
            } else if (selfClosingInd > -1) {
              const firstChild = translationValue.substring(0, selfClosingInd)
              if (firstChild) {
                newtChildren.push(firstChild)
              }
              newtChildren.push(children[i])
              translationValue = translationValue.substring(selfClosingInd + selfClosingTag.length)
            }
          })
          if (translationValue) {
            newtChildren.push(translationValue)
          }
          return h(tag, attrs, newtChildren)
        }
      }
    })
  }
})
