// e2e/page-objects/NavigationPage.ts
// Page Object Model for Navigation component

import type { Locator, Page } from "@playwright/test";

/**
 * NavigationPage represents the main navigation component
 * Used for navigating between different sections of the application
 */
export class NavigationPage {
  readonly page: Page;
  readonly plansLinkDesktop: Locator;
  readonly plansLinkMobile: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.plansLinkDesktop = page.getByTestId("nav-plans-link");
    this.plansLinkMobile = page.getByTestId("nav-plans-link-mobile");
    this.mobileMenuButton = page.locator("#menu-button");
  }

  /**
   * Navigate to Training Plans page (desktop navigation)
   */
  async clickPlansLink() {
    await this.plansLinkDesktop.click();
  }

  /**
   * Navigate to Training Plans page (mobile navigation)
   * Opens mobile menu first if not visible
   */
  async clickPlansLinkMobile() {
    // Open mobile menu if not visible
    const isMobileMenuVisible = await this.plansLinkMobile.isVisible();
    if (!isMobileMenuVisible) {
      await this.mobileMenuButton.click();
    }
    await this.plansLinkMobile.click();
  }

  /**
   * Verify navigation to Plans page
   */
  async expectPlansPage() {
    await this.page.waitForURL(/\/plans$/);
  }

  /**
   * Check if mobile navigation is being used (viewport width < 768px)
   */
  async isMobile(): Promise<boolean> {
    const viewportSize = this.page.viewportSize();
    return viewportSize ? viewportSize.width < 768 : false;
  }

  /**
   * Click Plans link (automatically detects desktop vs mobile)
   */
  async navigateToPlans() {
    const mobile = await this.isMobile();
    if (mobile) {
      await this.clickPlansLinkMobile();
    } else {
      await this.clickPlansLink();
    }
    await this.expectPlansPage();
  }
}
