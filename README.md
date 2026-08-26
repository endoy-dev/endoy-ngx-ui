# @endoy-dev/ngx-ui
Angular component library used across Endoy projects. It provides standalone components and directives (buttons, form controls, overlays, table, stepper, and more) built on Angular CDK and styled with Tailwind CSS v4 design tokens.

## Requirements
- Angular `^22.0.0` (`common`, `core`, `forms`, `cdk` are peer dependencies)
- A Tailwind CSS v4 setup in the consuming app (the library ships design tokens, not precompiled CSS)
- [`@lucide/angular`](https://lucide.dev/guide/angular/) `^1.31.0` for any component that renders an icon

## Installation
The package is published to the GitHub npm registry, so add `@endoy-dev` packages there in your `.npmrc`:
```
@endoy-dev:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then install:
```bash
npm install @endoy-dev/ngx-ui
```

## Setup
Import the theme once from your Tailwind entry stylesheet (the one that already contains `@import "tailwindcss";`) so its `@theme` tokens and `dark` variant are picked up by Tailwind:

```css
@import "tailwindcss";
@import "@endoy-dev/ngx-ui/theme.css";
```

## AI assistance
Parts of this library were created with the help of AI (Claude/Claude Code).
