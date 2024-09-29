# Skazka online portal https://dashboard.ipbez.kz/

## Technical overview

- **Next.js 14** with the app router
- Postgres with **Drizzle ORM**
- **Next Auth** for custom credentials login via **1C**
- Integration with 1C via **OData REST API**
- **Redis** for caching frequently accessed settings and OData API requests
- **Sentry** for error and performance tracking across the whole application
- **PostHog** for tracking user interaction and general app usage
- **shadcn/ui** components for most of the UI

## Features

### For sales (employees)

- Checking the status of the agent's orders (created, cancelled, completed), including the detailed information about the order
- Reports on the agent's sales, three different types of reports
- Reports on the clients' debt
- Latest stock pulled in real time from 1C
- Latest prices and information about upcoming deliveries

### For supervisors

- Tracking the employees orders: location and time taken to complete the orders

### For active clients

- Checking the status of the client's orders

### For all/potential clients

- Online catalogue of the products, including the detailed information about the product, stock and prices

## Project structure

- `./drizzle` - Drizzle Postgres migrations
- `./public` - Public folder for Next.js
- `./src`
  - `./actions` - Next.js server actions, separated logically by folders and files
  - `./app` - App router base directory
    - `./_components` - Used for locally used components
  - `./components` - Globally scoped components, including ShadCN
  - `./drizzle` - Drizzle database schema
  - `./hooks` - React hooks
  - `./lib` - Helper functions and adapters and controllers, including the OData helper, Redis helper and other. Should probably join this with the `data` folder...
  - `./schemas` - Validation ZOD schemas
  - `./scripts` - Helper scripts
- `./tests` - Playwright e2e tests

## CI structure

1. Project has two main git branches, `main` and `production`.
2. `main` branch triggers a pipeline that does the following:
   - Runs `npm install` and runs `npm run test`
   - A docker image is built and tagged `main`
   - The image is pushed to a private docker registry,
   - Coolify deploy webhook is triggered to re-deploy to https://staging.dashboard.ipbez.kz/
3. `production` branch does the same, except tags the image `production` and deploys to https://dashboard.ipbez.kz
4. E2E tests using Playwright are a work in progress and will be integrated into the pipeline.
