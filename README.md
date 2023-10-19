# Easegress Portal

Easegress Portal is an intuitive, open-source user interface for the [Easegress](https://github.com/megaease/easegress) traffic orchestration system. Developed with React.js, this portal provides config management, metrics, and visualizations, enhancing the overall Easegress experience.

## Features

-  **Intuitive User Interface:** Built with React.js—one of the most popular and efficient JavaScript libraries—our portal provides a smooth, user-friendly experience. Navigate, manage, and monitor with ease.

-  **Unified Configuration Management:** Graphical representation of core Easegress concepts ensures intuitive control over configurations and monitoring data. Directly import native Easegress configurations and manage them through a straightforward interface.

-  **Fully Open-Source, Easy Contributions:** We've open-sourced the entire Easegress Portal. Dive into the code, customize according to your needs, and join us in refining and expanding its capabilities. Developed with React.js and best practices, it's convenient for developers to contribute or customize.

-  **Seamless Integration:** The portal integrates directly with the Easegress API without the need for middleware. We also offer a Docker Image for a one-click start-up.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Screenshots

**1. Cluster Management**

[](./docs/imgs/cluster.png)

**2. Traffic Management**

[](./docs/imgs/traffic-list.png)

[](./docs/imgs/traffic-http-server.png)

**3. Pipeline Management**

[](./docs/imgs/pipeline-list.png)

[](./docs/imgs/pipeline-detail.png)

[](./docs/imgs/pipeline-edit.png)

**4. Controller Management**

[](./docs/imgs/controller-list.png)

**5. Logs**

[](./docs/imgs/logs.png)

## Community

- [Join Slack Workspace](https://join.slack.com/t/openmegaease/shared_invite/zt-upo7v306-lYPHvVwKnvwlqR0Zl2vveA) for requirement, issue and development.
- [MegaEase on Twitter](https://twitter.com/megaease)

## Contributing

See [Contributing guide](./CONTRIBUTING.md#contributing).

## License

Easegress is under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for details.
