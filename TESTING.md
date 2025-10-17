# Testing Guide - Fitness Tracker

Comprehensive guide for writing and running tests in the Fitness Tracker application.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Unit Testing with Vitest](#unit-testing-with-vitest)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

The Fitness Tracker project uses a multi-layered testing approach:

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest with mocked dependencies
- **E2E Tests**: Playwright for end-to-end user flows
- **Visual Regression**: Playwright screenshots

### Test Coverage Goals

- Unit Tests: ≥75% code coverage
- Critical User Paths: 100% E2E coverage
- All components: Component tests with accessibility checks

## Test Structure

```
fitness-tracker/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       └── button.test.tsx          # Component tests
│   ├── lib/
│   │   ├── utils.ts
│   │   └── utils.test.ts                # Unit tests
│   └── test/
│       ├── setup.ts                     # Global test setup
│       └── utils.tsx                    # Test utilities & helpers
├── e2e/
│   ├── fixtures/
│   │   └── test-fixtures.ts             # Custom Playwright fixtures
│   ├── page-objects/
│   │   ├── LoginPage.ts                 # Page Object Model
│   │   └── DashboardPage.ts
│   ├── auth/
│   │   └── login.spec.ts                # Feature tests
│   └── example.spec.ts                  # Example E2E tests
├── vitest.config.ts                     # Vitest configuration
├── playwright.config.ts                 # Playwright configuration
└── TESTING.md                           # This file
```

## Unit Testing with Vitest

### Configuration

Vitest is configured in `vitest.config.ts` with:

- **Environment**: jsdom for DOM testing
- **Coverage**: v8 provider with 75% thresholds
- **Setup**: Global setup in `src/test/setup.ts`
- **Globals**: Test utilities available globally

### Writing Unit Tests

#### Testing Utilities

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });
});
```

#### Testing React Components

```typescript
// src/components/ui/button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button Component", () => {
  it("should render button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Utilities

Custom utilities are available in `src/test/utils.tsx`:

- `renderWithProviders()` - Render components with context providers
- `mockSupabaseClient` - Mocked Supabase client for testing
- `createMockUser()` - Generate mock user data
- `createMockWorkout()` - Generate mock workout data

```typescript
import { renderWithProviders, createMockUser } from "@/test/utils";

test("renders user profile", () => {
  const mockUser = createMockUser({ name: "John Doe" });
  renderWithProviders(<Profile user={mockUser} />);
  // ... assertions
});
```

### Mocking

#### Mocking Modules

```typescript
import { vi } from "vitest";

// Mock entire module
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signIn: vi.fn(),
    },
  },
}));
```

#### Mocking Functions

```typescript
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: "test" });

expect(mockFn).toHaveBeenCalledWith("expected-arg");
```

## E2E Testing with Playwright

### Configuration

Playwright is configured in `playwright.config.ts` with:

- **Browser**: Chromium (Desktop Chrome)
- **Base URL**: http://localhost:4321
- **Auto-start**: Development server starts automatically
- **Artifacts**: Screenshots and videos on failure
- **Reporters**: HTML, JSON, and list

### Writing E2E Tests

#### Basic Test Structure

```typescript
// e2e/example.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Fitness Tracker/i);
  });
});
```

#### Page Object Model

Organize tests using Page Object Model (POM):

```typescript
// e2e/page-objects/LoginPage.ts
import type { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

Using POM in tests:

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";

test.describe("Login Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should display login form", async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
```

#### Custom Fixtures

Create reusable test fixtures in `e2e/fixtures/test-fixtures.ts`:

```typescript
import { test as base, type Page } from "@playwright/test";

interface TestFixtures {
  authenticatedPage: Page;
}

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login logic
    await page.goto("/auth/login");
    // ... perform login
    await use(page);
    // Cleanup
  },
});

export { expect } from "@playwright/test";
```

Use custom fixture:

```typescript
import { test, expect } from "../fixtures/test-fixtures";

test("should access dashboard", async ({ authenticatedPage }) => {
  await authenticatedPage.goto("/dashboard");
  // User is already logged in
});
```

#### Visual Regression Testing

```typescript
test("should match login page screenshot", async ({ page }) => {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveScreenshot("login-page.png", {
    fullPage: true,
    maxDiffPixels: 100,
  });
});
```

## Running Tests

### Unit Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once (CI mode)
npm run test -- --run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific test file
npm run test -- src/lib/utils.test.ts

# Run tests matching pattern
npm run test -- -t "should merge class names"
```

### E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (visible browser)
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- e2e/auth/login.spec.ts

# Run tests matching pattern
npm run test:e2e -- -g "should display login form"

# View HTML report
npm run test:e2e:report
```

### All Tests

```bash
# Run unit tests with coverage + E2E tests
npm run test:all
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
   ```typescript
   // ✅ Good - tests user interaction
   test("should show error on invalid input", async () => {
     const user = userEvent.setup();
     render(<Form />);
     await user.click(screen.getByRole("button"));
     expect(screen.getByText(/error/i)).toBeVisible();
   });

   // ❌ Bad - tests implementation detail
   test("should call validateForm", () => {
     const spy = vi.spyOn(utils, "validateForm");
     render(<Form />);
     expect(spy).toHaveBeenCalled();
   });
   ```

2. **Use accessible queries**
   ```typescript
   // ✅ Good - accessible
   screen.getByRole("button", { name: /submit/i });
   screen.getByLabelText(/email/i);

   // ❌ Bad - fragile
   screen.getByClassName("submit-btn");
   screen.getByTestId("email-input");
   ```

3. **Keep tests isolated**
   ```typescript
   // Each test should be independent
   test("test 1", () => {
     const data = createMockData();
     // test with data
   });

   test("test 2", () => {
     const data = createMockData(); // Fresh data
     // test with data
   });
   ```

### E2E Tests

1. **Use data-testid for test-specific selectors**
   ```typescript
   // In component
   <button data-testid="submit-button">Submit</button>

   // In test
   await page.locator('[data-testid="submit-button"]').click();
   ```

2. **Wait for stable state**
   ```typescript
   // ✅ Good - wait for network idle
   await page.goto("/");
   await page.waitForLoadState("networkidle");

   // ❌ Bad - arbitrary timeout
   await page.goto("/");
   await page.waitForTimeout(5000);
   ```

3. **Use Page Object Model for reusability**
   - Encapsulate page interactions in classes
   - Reduce code duplication
   - Make tests more maintainable

4. **Test critical user paths**
   - Authentication flow
   - Core features (workout creation, completion)
   - Payment flows (if applicable)
   - Error scenarios

### General

1. **Follow AAA pattern**
   ```typescript
   test("example", () => {
     // Arrange - setup
     const user = createMockUser();

     // Act - perform action
     const result = processUser(user);

     // Assert - verify result
     expect(result).toBe(expected);
   });
   ```

2. **Write descriptive test names**
   ```typescript
   // ✅ Good
   test("should display error when email is invalid");

   // ❌ Bad
   test("test email");
   ```

3. **One assertion per test (when possible)**
   ```typescript
   // ✅ Good - focused test
   test("should display username", () => {
     render(<Profile user={mockUser} />);
     expect(screen.getByText(mockUser.name)).toBeVisible();
   });

   // ⚠️ Acceptable - related assertions
   test("should render profile info", () => {
     render(<Profile user={mockUser} />);
     expect(screen.getByText(mockUser.name)).toBeVisible();
     expect(screen.getByText(mockUser.email)).toBeVisible();
   });
   ```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-commit Hooks

Tests run automatically on commit:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run test -- --run"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### Vitest: Module not found

```bash
# Clear cache and reinstall
rm -rf node_modules .vitest
npm install
```

#### Playwright: Browser not installed

```bash
# Install browsers
npx playwright install chromium
```

#### Tests timing out

```typescript
// Increase timeout for specific test
test("slow test", async () => {
  // ... test code
}, 30000); // 30 seconds

// Or in config
export default defineConfig({
  test: {
    testTimeout: 10000,
  },
});
```

#### Flaky tests

- Use `waitForLoadState` instead of `waitForTimeout`
- Add explicit waits for elements
- Check for race conditions
- Use `test.retry(2)` for flaky tests (temporary)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**For more information, see the [Test Plan](.ai/test-plan.md)**
