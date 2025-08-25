---
title: Spotlight
description: Meet the people behind Hey API.
---

<script setup lang="ts">
import { VPTeamMembers } from 'vitepress/theme'
import { coreTeam } from '../../data/coreTeam.js'
import { hallOfFame } from '../../data/hallOfFame.js'
</script>

# Spotlight

Meet the people behind Hey API. To join this list, please refer to the [contributing](/openapi-ts/community/contributing) guide.

## Core Team

These people actively maintain Hey API.

<VPTeamMembers class="people" size="small" :members="coreTeam" />

Do you want to join the core team? Send us a short [email](mailto:lubos@heyapi.dev?subject=Join%20Core%20Team) describing your interest in Hey API, any relevant experience, and what you're hoping to work on.

## Hall of Fame

These are the people with significant contributions to Hey API. A special thank you goes to [Ferdi Koomen](https://madebyferdi.com) for allowing us to use the original source code from OpenAPI TypeScript Codegen. None of this would've been possible without you!

<VPTeamMembers class="people" size="small" :members="hallOfFame" />

## Contributors

The complete list of contributors to Hey API.

<div class="contributors-list">

<!--@include: ../../partials/contributors-list.md-->

</div>

A sincere thank you for your contributions.

<style>
.vp-doc .VPTeamMembers.people.small .container {
  grid-template-columns: repeat(auto-fit, minmax(284px, 1fr)) !important;
}

@media (max-width: 640px) {
  .vp-doc .VPTeamMembers.people.small .container {
    max-width: 100% !important;
  }
}

.VPTeamMembersItem.small {
  max-width: 400px;
}

.VPTeamMembersItem.small .profile {
  align-items: center;
  display: flex;
  padding: 1rem 1.4rem !important;
}

.VPTeamMembersItem.small .profile .avatar {
  margin: 0 1rem 0 0;
}

.VPTeamMembersItem.small .profile .data {
  padding: 0;
  text-align: left;
}

.VPTeamMembersItem.small .profile .data .links {
  justify-content: initial;
  margin: 0 -8px -20px;
  padding: 4px 0;
}
</style>
