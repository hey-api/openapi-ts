---
title: Philosophy
description: Hello from Hey API.
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const hallOfFame = [
  {
    avatar: 'https://github.com/ferdikoomen.png',
    name: 'Ferdi Koomen',
    links: [
      { icon: 'github', link: 'https://github.com/ferdikoomen' },
    ],
    title: 'OpenAPI TypeScript Codegen',
  },
  {
    avatar: 'https://github.com/nicolas-chaulet.png',
    name: 'Nicolas Chaulet',
    links: [
      { icon: 'github', link: 'https://github.com/nicolas-chaulet' },
    ],
    title: 'Made the Hey API fork',
  },
  {
    avatar: 'https://github.com/jordanshatford.png',
    name: 'Jordan Shatford',
    links: [
      { icon: 'github', link: 'https://github.com/jordanshatford' },
    ],
    title: 'Maintainer and Contributor',
  },
]
</script>

# About

Hey API's objective is to provide a suite of TypeScript tools to manage API interactions. Whether you're building a front-end application, API-to-API service, or micro-frontends, we want Hey API to be your go-to resource.

Typically, developers of such applications want to:

- use TypeScript interfaces to model data for their APIs
- send and fetch this data from server in a type-safe way
- build further abstractions on top of this data

Doing any of these steps manually quickly becomes a huge time sink as your project grows and APIs evolve. Ideally, you want to spend most time on your application. Hey API allows you to do just that.

We're constantly learning about the ways in which you use our tools. If you have any feedback, please [email us](mailto:lubos@heyapi.dev), [open an issue](https://github.com/hey-api/openapi-ts/issues), or [join a discussion](https://github.com/orgs/hey-api/discussions).

## Hall of Fame

These are the people with significant contributions to Hey API. A special thank you goes to [Ferdi Koomen](https://madebyferdi.com/) for allowing us to use the original source code from OpenAPI TypeScript Codegen. None of this would've been possible without you!

<VPTeamMembers size="small" :members="hallOfFame" />

<!--@include: ./sponsorship.md-->
