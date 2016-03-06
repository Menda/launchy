@watch
Feature: App functionality

  As a human
  I want to see the basic app functionality works
  So I can use the portal

  Scenario: See all links
    Given I have visited the homepage
    Then Links work as expected

@watch
Feature: Homepage functionality

  As a human
  I want to see the homepage
  So I can start browsing

  Scenario: See the page title
    Given I have visited the homepage
    Then I see the header "Coches usados de gama alta, de disfrute, exclusivos y clásicos."
