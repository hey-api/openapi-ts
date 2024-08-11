---
title: Philosophy
description: Hello from Hey API.
---

<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://github.com/mrlubos.png',
    name: 'Lubos',
    title: 'Author',
    links: [
      { icon: 'github', link: 'https://github.com/mrlubos' },
      { icon: 'twitter', link: 'https://twitter.com/mrlubos' }
    ],
    sponsor: 'https://github.com/sponsors/mrlubos',
  },
  {
    avatar: 'https://github.com/jordanshatford.png',
    name: 'Jordan',
    title: 'Maintainer',
    links: [
      { icon: 'github', link: 'https://github.com/jordanshatford' },
    ],
  },
]
</script>

# About

Hey API's objective is to provide a suite of TypeScript tools to manage API interactions. Whether you're building a front-end application, API-to-API service, or micro-frontends, we want Hey API to be your go-to resource.

Typically, developers of such applications want to:

- use TypeScript interfaces to model data for their APIs
- send and fetch this data from server in a typesafe way
- build further abstractions on top of this data

Doing any of these steps manually quickly becomes a huge time sink as your project grows and APIs evolve. Ideally, you want to spend most time on your application. Hey API allows you to do just that.

We're constantly learning about the ways in which you use our tools. If you have any feedback, please [email us](mailto:lmenus@lmen.us), [open an issue](https://github.com/hey-api/openapi-ts/issues), or [join a discussion](https://github.com/hey-api/openapi-ts/discussions).

## Team

<VPTeamMembers size="small" :members="members" />

Our core members are [Jordan](https://github.com/jordanshatford) and [Lubos](https://lmen.us/), but we also accept external contributions. Please see our [contributing](./contributing) guide for more information.

## Acknowledgements

None of this would be possible without [Ferdi Koomen](https://madebyferdi.com/) and the contributors to OpenAPI TypeScript Codegen throughout the years. We want to say a huge thank you to all of you, and promise to continue the legacy of the original project.

<!--@include: ./sponsorship.md-->
