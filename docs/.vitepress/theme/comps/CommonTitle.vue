<template>
  <div>
    <h1>Day {{ frontmatter.day }}<br />{{ frontmatter.title }}</h1>
    <blockquote>
      🔗 原文链接：<a :href="frontmatter.link">{{ frontmatter.title }}</a>
    </blockquote>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData();

</script>

<style lang="scss" scoped>
</style>
