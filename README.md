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

You can start editing the page. The page auto-updates as you edit the file.

## Using Docker

**1. [Install Docker](https://docs.docker.com/get-docker/) on your machine.**

**2. Build your container:**
```bash
docker build -t megaease/easegress-portal -f rootfs/Dockerfile .
```

**3. Run your container:**
```bash
docker run -p 3000:3000 megaease/easegress-portal
```

You can view your images created with `docker images`.

## Screenshots

**1. Cluster Management**

![cluster](./docs/imgs/cluster.png)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Feasegress-io%2Feasegress-portal.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Feasegress-io%2Feasegress-portal?ref=badge_shield)

**2. Traffic Management**

![traffic list](./docs/imgs/traffic-list.png)

![traffic http server](./docs/imgs/traffic-http-server.png)

**3. Pipeline Management**

![pipeline list](./docs/imgs/pipeline-list.png)

![pipeline detail](./docs/imgs/pipeline-detail.png)

![pipeline edit](./docs/imgs/pipeline-edit.png)

**4. Controller Management**

![controller list](./docs/imgs/controller-list.png)

**5. Logs**

![logs](./docs/imgs/logs.png)

## Community

- [Join Slack Workspace](https://join.slack.com/t/openmegaease/shared_invite/zt-upo7v306-lYPHvVwKnvwlqR0Zl2vveA) for requirement, issue and development.
- [MegaEase on Twitter](https://twitter.com/megaease)

## Contributing

See [Contributing guide](./CONTRIBUTING.md#contributing).

## License

Easegress is under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for details.


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Feasegress-io%2Feasegress-portal.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Feasegress-io%2Feasegress-portal?ref=badge_large)