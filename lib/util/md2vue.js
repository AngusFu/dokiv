const md2vue = require('md2vue')
const Prepack = require("prepack")

module.exports = compileVue

/**
 * compile markdown to precompiled vue component
 */
async function compileVue ({
  title,
  markdown,
  componentName
}) {
  let id = 0

  // FIXME
  const customMarkups = () => {
    const uid = `${componentName}-${id++}`
    return `
<input id="${uid}" type="checkbox" tabindex="-1" aria-hidden="true"/>
<label for="${uid}" aria-hidden="true"></label>
<div class="vue-demo-tools">
  <div>
    <a @click="$code.open($event)" title="在 Codepen 中打开"><c-icon type="feather" name="codepen" class="vue-demo-tools__icon"/></a>
    <a @click="$code.copy($event)" title="复制代码"><c-icon type="feather" name="copy" class="vue-demo-tools__icon"/></a>
  </div>
</div>`
  }

  const documentInfo = {
    // eslin-disale-next-line
    metaInfo: new Function(`return { title: "${title}" }`)
  }

  process.env.__VUE_ENV = process.env.VUE_ENV
  process.env.__NODE_ENV = process.env.NODE_ENV
  process.env.VUE_ENV = 'browser'
  process.env.NODE_ENV = 'production'

  const raw = await md2vue(markdown, {
    target: 'js',
    highlight: 'highlight.js',
    documentInfo,
    componentName,
    customMarkups
  })

  process.env.VUE_ENV = process.env.__VUE_ENV
  process.env.NODE_ENV = process.env.__NODE_ENV

  const { code } = Prepack.prepack(raw)

  return `
(function(){
  var ${componentName} = null;
  ${code};
  return ${componentName};
})()`
}