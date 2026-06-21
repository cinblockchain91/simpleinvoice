# SimpleInvoice

![SimpleInvoice Demo](docs/demo1.PNG)

> **101 Digital Web Engineer Assessment** — v2.2.4  
> A production-grade invoicing web application built on Next.js 16, React 19, and TypeScript 5.

**Live demo:** https://simpleinvoice-web.vercel.app  
**Username:** 94756921275  
**Password:** Password@12345

---

## Documentation

| Topic                                                     | Description                                                                                                 |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Overview](docs/01-overview.md)                           | What the app does and how the BFF proxy keeps tokens off the browser                                        |
| [Architecture](docs/02-architecture.md)                   | Feature-Sliced Hexagonal (FSH) pattern, dependency rule, monorepo layout, and the BFF security flow diagram |
| [Tech Stack](docs/03-tech-stack.md)                       | Every library used and the rationale behind each choice                                                     |
| [Project Structure](docs/04-project-structure.md)         | Annotated directory tree covering all FSD layers, BFF routes, and test infrastructure                       |
| [Getting Started](docs/05-getting-started.md)             | Clone → install → configure env vars → run locally                                                          |
| [Running Tests](docs/06-running-tests.md)                 | Unit, integration (MSW), E2E (Playwright), and type-check commands                                          |
| [Available Scripts](docs/07-available-scripts.md)         | Full list of `pnpm` commands with descriptions                                                              |
| [Environment Variables](docs/08-environment-variables.md) | All required server-only env vars and where to set them                                                     |
| [Security Design](docs/09-security-design.md)             | HttpOnly cookies, BFF proxy, CSP headers, secrets hygiene, and boundary tests                               |
| [Internationalization](docs/10-internationalization.md)   | English / Vietnamese URL-based locale routing and language switcher                                         |
| [Design Decisions](docs/11-design-decisions.md)           | Architectural "why" answers — hexagonal core, Result type, TanStack Query, MSW                              |
