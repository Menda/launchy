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

@watch
Feature: Create Ad functionality

  As a human
  I want to be able to create a new Ad
  So I sell my car

  Scenario: See the createAd page
    Given I have visited the createAd
    Then I see the header "Sube el anuncio de tu coche"

  Scenario: T&C are not accepted
    Given I have visited the createAd
    When I fill a basic ad
    And Submit the form
    Then I see an error in the form

  Scenario: Ad is created successfully
    Given I have visited the createAd
    When I fill a basic ad
    And Check the T&C
    And Submit the form
    Then I see the success page

  Scenario: Ad is created successfully with picture
    Given I have visited the createAd
    When I fill a basic ad
    And Add a picture to it
    And Check the T&C
    And Submit the form
    Then I see the success page
    And I the car inserted in the database
