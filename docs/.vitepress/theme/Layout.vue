<script setup>
import DefaultTheme from 'vitepress/theme';

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #layout-top>
      <div class="announcement">
        <span> Build better APIs with Hey API Platform </span>
        <a
          href="https://app.heyapi.dev/"
          rel="noopener noreferrer"
          target="_blank"
          >Dashboard</a
        >
      </div>
      <!-- <div class="announcement">
        <span>
          Request a feature<span class="hide-sm"> for your business</span>
        </span>
        <a
          aria-label="Send an email to Lubos"
          href="mailto:lubos@heyapi.dev?subject=Priority%20Feature%20Request"
          target="_blank"
        >
          Let's Talk
        </a>
      </div> -->
    </template>
    <!-- <template #home-features-before>
      <a
        aria-label="Send an email to Lubos"
        class="migration"
        href="mailto:lubos@heyapi.dev?subject=Migrate%20TypeScript%20SDKs"
      >
        <p>Migrate your existing TypeScript SDKs</p>
        <p>Contact us</p>
      </a>
    </template> -->
  </Layout>
</template>

<style scoped>
.announcement {
  align-items: center;
  background-color: var(--vp-c-bg);
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  column-gap: 0.5rem;
  display: flex;
  font-size: var(--announcement-font-size);
  height: var(--announcement-height);
  justify-content: center;
  left: 0;
  line-height: 1;
  min-height: 1rem;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 31;
}

.announcement > a {
  background-color: var(--vp-button-brand-bg);
  border-radius: 4px;
  color: var(--vp-button-brand-text);
  font-size: 0.8em;
  font-weight: 600;
  padding: 0.4em 0.75em;
}

@media (width < 720px) {
  .hide-sm {
    display: none;
  }
}

@media (width >= 720px) {
  .show-sm {
    display: none;
  }
}
</style>

<style>
:root {
  --announcement-font-size: 0.875rem;
  --announcement-height: 2.25rem;
  --vp-layout-top-height: var(--announcement-height);
  --vp-nav-height: 48px;
}

@media (width < 960px) {
  aside.VPSidebar {
    top: 0 !important;
  }
}

@media (width >= 1200px) {
  :root {
    --announcement-height: 2.5rem;
  }
}
</style>
