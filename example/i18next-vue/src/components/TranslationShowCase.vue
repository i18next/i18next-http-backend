<template>
  <div class="hello">
    <h1>{{ $t("welcome") }}</h1>
    <!--<p>
      <TransComponent i18nKey="descr">
        <a href="https://cli.vuejs.org" target="_blank" rel="noopener" /><i>👋</i>
      </TransComponent>
    </p>
    <div>
      <div>
        <span v-t="{key:'end'}" /> <i v-t="'end'" />
      </div>
    </div>
    <hr />-->
    <div>
      <div>
        <a v-if="$i18next.resolvedLanguage !== 'de'" v-on:click="$i18next.changeLanguage('de')">
          DE
        </a>
        <strong v-if="$i18next.resolvedLanguage === 'de'">
          DE
        </strong>
        &nbsp;|&nbsp;
        <a v-if="$i18next.resolvedLanguage !== 'en'" v-on:click="$i18next.changeLanguage('en')">
          EN
        </a>
        <strong v-if="$i18next.resolvedLanguage === 'en'">
          EN
        </strong>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TranslationShowCase'
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
