# Initial Unit Testing Guide

This guide defines the first unit-testing setup for the Tabulation System.

It is written for the current project stack:

- Nuxt `4.5.x`
- Vue `3.5.x`
- TypeScript
- Node.js `22` (the version used by the Docker images)
- Nuxt server API routes with Prisma and `nuxt-auth-utils`

The initial goal is fast, deterministic tests for client-side state and Vue
components. Database-backed API and browser-flow tests should be added as a
second layer after this foundation is working.

## 1. What is needed

### Required development dependencies

Install the following packages with npm:

```bash
npm install -D @nuxt/test-utils@^4 vitest@^4 @vitest/coverage-v8@^4 @vue/test-utils@^2 happy-dom
```

Package responsibilities:

| Package | Purpose |
| --- | --- |
| `vitest` | Test runner, assertions, mocks, watch mode, and coverage integration |
| `@vitest/coverage-v8` | V8-based coverage reports |
| `@vue/test-utils` | Mount and interact with Vue 3 components |
| `happy-dom` | Lightweight DOM implementation for component tests |
| `@nuxt/test-utils` | Nuxt-aware Vitest environment and utilities such as `mountSuspended` |

Keep `@nuxt/test-utils` and `vitest` on compatible major versions. The
commands above target the current Nuxt Test Utils 4 / Vitest 4 combination;
review peer-dependency warnings during installation before committing the
lockfile.

### Repository files to add or update

The initial setup needs these files or changes:

```text
vitest.config.ts                         # Vitest projects and environments
test/
├── unit/                                # Pure logic tests
└── nuxt/                                # Vue components and Nuxt runtime tests
    ├── ResultsTable.test.ts              # First component test
    └── useTabulationState.test.ts        # First composable test
```

Update `package.json` with these scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Add generated test output to `.gitignore`:

```gitignore
.vitest/
coverage/
```

Do not commit coverage output or test snapshots unless the team explicitly
decides to version them.

## 2. Define the test boundary

Use the cheapest test type that gives useful confidence:

| Test type | First target in this project | External systems |
| --- | --- | --- |
| Pure unit | Formatting, ranking, validation, authorization policy helpers | None |
| Vue component | `ResultsTable.vue`, `EventLeaderboard.vue`, form states | DOM only; mock fetches |
| Nuxt runtime | `useTabulationState.ts`, middleware, components using Nuxt auto-imports | Nuxt test environment; no real DB |
| API integration | `/api/events`, `/api/events/:id/results`, login and role checks | Test database or isolated service |
| E2E | Login, admin event workflow, judge scoring workflow | Browser, running app, database |

The first pull request should cover the first three rows. Do not make unit
tests depend on the developer's PostgreSQL instance, `.env` secrets, seeded
admin account, network, or wall-clock time.

## 3. Create the Vitest configuration

Create `vitest.config.ts` at the repository root:

```ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'happy-dom',
          clearMocks: true,
          restoreMocks: true,
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          clearMocks: true,
          restoreMocks: true,
        },
      }),
    ],
  },
})
```

Why two projects?

- `unit` is quick and uses only a DOM shim. Use it for components that do not
  require Nuxt auto-imports or runtime plugins.
- `nuxt` starts the Nuxt test environment. Use it when a test calls
  `useState`, `useFetch`, `useRoute`, `useRuntimeConfig`, or another Nuxt
  composable/auto-import.

Keep the test environment explicit. A test that needs Nuxt runtime context
should not silently pass because a global mock happens to exist in another
test file.

## 4. Write the first component test

Create `test/nuxt/ResultsTable.test.ts`:

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ResultsTable from '~/components/ResultsTable.vue'

describe('ResultsTable', () => {
  it('renders the contestant and weighted total', () => {
    const wrapper = mount(ResultsTable, {
      props: {
        mode: 'total',
        criterias: [
          { criteriaId: 'presentation', criteriaName: 'Presentation', weight: 60 },
        ],
        rows: [
          {
            rank: 1,
            complete: true,
            weightedTotal: 89.5,
            contestant: {
              id: 'contestant-1',
              alias: 'Ada',
              name: 'Ada Lovelace',
              characterName: 'The Analyst',
              cosplayPictureUrl: null,
            },
            criteriaBreakdown: [
              {
                criteriaId: 'presentation',
                average: 89.5,
                weighted: 53.7,
                score: null,
              },
            ],
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Ada')
    expect(wrapper.text()).toContain('Ada Lovelace')
    expect(wrapper.text()).toContain('89.50')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })

  it('shows an em dash when optional contestant data is missing', () => {
    const wrapper = mount(ResultsTable, {
      props: {
        mode: 'total',
        criterias: [],
        rows: [{
          rank: 2,
          complete: false,
          weightedTotal: 0,
          contestant: {
            id: 'contestant-2',
            alias: null,
            name: 'Unnamed contestant',
            characterName: null,
            cosplayPictureUrl: null,
          },
          criteriaBreakdown: [],
        }],
      },
    })

    expect(wrapper.text()).toContain('—')
    expect(wrapper.find('tbody tr').classes()).toContain('opacity-60')
  })
})
```

Test observable behavior: props in, rendered output and classes out. Avoid
asserting Tailwind implementation details unless the class itself represents
business behavior, such as the incomplete-row opacity state above.

For interactive components, always await Vue Test Utils actions:

```ts
await wrapper.get('[data-test="save"]').trigger('click')
await wrapper.get('input').setValue('new value')
```

Prefer stable `data-test` selectors for important controls. Add those
attributes to components when a semantic selector is not available.

## 5. Test a Nuxt composable

`useTabulationState` calls Nuxt's `useState`, so it belongs in the `nuxt`
project rather than the plain DOM project.

Create `test/nuxt/useTabulationState.test.ts`:

```ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { describe, expect, it } from 'vitest'
import { useTabulationState } from '~/composables/useTabulationState'

const Harness = defineComponent({
  setup() {
    const { lastLeaderboardUpdate, markLeaderboardUpdated } = useTabulationState()
    const updated = lastLeaderboardUpdate('event-1')

    return { updated, markLeaderboardUpdated }
  },
  template: `
    <div>
      <span data-test="updated">{{ updated }}</span>
      <button
        data-test="mark"
        @click="markLeaderboardUpdated('event-1', new Date('2026-01-01T00:00:00.000Z'))"
      >
        Mark updated
      </button>
    </div>
  `,
})

describe('useTabulationState', () => {
  it('starts empty and stores the last leaderboard update', async () => {
    const wrapper = await mountSuspended(Harness)

    expect(wrapper.get('[data-test="updated"]').text()).toBe('')

    await wrapper.get('[data-test="mark"]').trigger('click')

    expect(wrapper.get('[data-test="updated"]').text()).toBe(
      '2026-01-01T00:00:00.000Z',
    )
  })
})
```

The fixed date makes this test deterministic. Do not assert against an
uncontrolled `new Date()` value.

## 6. Test the server layer safely

Do not connect unit tests to the real Prisma client from
`server/utils/prisma.ts`. The first server-test increment should extract
pure logic from handlers, then test the handler wiring separately.

Recommended order:

1. Extract pure validation, score calculation, ranking, and role-policy
   functions into small server utility modules.
2. Test boundary values and invalid input in the `unit` project.
3. Mock Prisma and session helpers when testing a route's decision branches.
4. Add API integration tests with an isolated test database only after the
   unit suite is stable.

High-value initial server cases for this application:

- score values at minimum, maximum, decimal, missing, and invalid ranges;
- weighted totals and descending rank order;
- duplicate score submission using the expected `upsert` behavior;
- `ADMIN` and `JUDGE` access decisions;
- unauthenticated requests returning `401`;
- authenticated users with the wrong role returning `403`;
- attempts to access an event, contestant, or score outside the user's scope;
- validation failures that do not call Prisma.

The API tests should use realistic request/response boundaries, but should not
require a developer's local seed data. Give the test database its own
connection string and reset strategy in CI.

## 7. Run the tests

After installing the dependencies and adding the scripts:

```bash
# Run all tests once; use this in CI
npm test

# Re-run affected tests while developing
npm run test:watch

# Generate text and HTML coverage output
npm run test:coverage

# Run only the first component test
npx vitest run test/unit/ResultsTable.test.ts

# Run only Nuxt-runtime tests
npx vitest run --project nuxt
```

The test command should be green before a change is reviewed. If no tests are
found, treat that as a setup failure rather than a successful test run.

## 8. Coverage and QA acceptance criteria

Do not chase a percentage before behavior is covered. For the first milestone,
the following is the acceptance checklist:

- [ ] `npm test` passes from a clean checkout.
- [ ] The first component test covers normal rendering.
- [ ] The first component test covers missing/optional data.
- [ ] The composable test runs in the Nuxt environment.
- [ ] Tests do not require PostgreSQL, external HTTP, or `.env` secrets.
- [ ] Tests do not depend on the current date or test execution order.
- [ ] Mocked functions are reset between tests.
- [ ] At least one failure-path test exists for each new validation rule.
- [ ] `npm run test:coverage` produces a report without committing generated files.
- [ ] `npm run build` still passes after the testing dependencies are added.
- [ ] CI runs `npm ci`, `npm test`, and `npm run build`.

Suggested initial coverage focus:

1. scoring/ranking logic and validation;
2. `useTabulationState`;
3. `ResultsTable.vue` and `EventLeaderboard.vue`;
4. login and role-guard decision branches;
5. API error handling and authorization boundaries.

## 9. Test-writing rules for this project

- Name tests by behavior: `shows an em dash when optional data is missing`.
- Keep one primary behavior per test.
- Arrange realistic input, act through the public interface, and assert the
  user-visible or API-visible result.
- Use `mount` for isolated Vue components and `mountSuspended` for components
  or harnesses that need Nuxt runtime context.
- Use `vi.fn()` and `vi.mock()` for external collaborators; do not mock the
  function under test.
- Keep Prisma, sessions, timers, random values, and network requests behind
  explicit test doubles.
- Use `beforeEach`/`afterEach` only for shared setup and cleanup; avoid hidden
  global state.
- Prefer a small number of meaningful assertions over snapshots of entire
  generated HTML.
- Review changed behavior and its failure paths, not only the coverage number.

## 10. Follow-up testing layers

After the initial unit suite is established:

### API integration tests

Use Nuxt Test Utils or a test HTTP server to exercise the Nitro endpoints.
Run against an isolated PostgreSQL database or a disposable CI service. Cover
authentication, authorization, Prisma persistence, and response contracts.

### End-to-end tests

Add a browser runner for the critical workflows:

1. Admin logs in and creates/configures an event.
2. Admin assigns judges and contestants.
3. Judge logs in and submits scores.
4. Admin views the weighted results and refreshes the leaderboard.

E2E tests should verify the deployed-like behavior; they should not duplicate
every branch already covered by unit tests.

## References

- [Nuxt Test Utils](https://nuxt.com/modules/test-utils)
- [Nuxt Test Utils example Vitest configuration](https://github.com/nuxt/test-utils/blob/main/examples/app-vitest/vitest.config.ts)
- [Vitest Getting Started](https://vitest.dev/guide/)
- [Vitest configuration reference](https://vitest.dev/config/)
- [Vue Test Utils for Vue 3](https://test-utils.vuejs.org/guide/)
