@watch
Feature: Create Ad functionality

  As a human
  I want to be able to create a new Ad
  So I sell my car

  Scenario: See the createAd page
    Given I have visited the createAd
    Then I see the header "Sube el anuncio de tu coche"

  Scenario: No phone or email is filled
    Given I have visited the createAd
    When I fill a basic ad
    And Add a picture to it
    And "email" is not filled
    And "phone" is not filled
    And Check the T&C
    And Submit the form
    Then I see an error in the form

  Scenario: No fullname is filled
    Given I have visited the createAd
    When I fill a basic ad
    And Add a picture to it
    And "fullname" is not filled
    And Check the T&C
    And Submit the form
    Then I see an error in the form

  Scenario: T&C are not accepted
    Given I have visited the createAd
    When I fill a basic ad
    And Add a picture to it
    And Submit the form
    Then I see an error in the form

  Scenario: Ad is created but not assigned to user
    Given I have visited the createAd
    And I am not logged in
    When I fill a basic ad
    And Add a picture to it
    And Check the T&C
    And Submit the form
    Then I see the 'almost there' page

  Scenario: Ad is created with a pre-logged in user
    Given I have visited the createAd
    And I have an account
    And I am logged in
    When I fill a basic ad
    And Add a picture to it
    And Check the T&C
    And Submit the form
    Then I see the success page

  Scenario: Ad is created with a post-logged in user
    Given I have visited the createAd
    When I fill a basic ad
    And Add a picture to it
    And Check the T&C
    And Submit the form
    And I log in
    Then I see the success page

  Scenario: Ad is created successfully with picture
    Given I have visited the createAd
    And I have an account
    And I am logged in
    When I fill a basic ad
    And Add a picture to it
    And Check the T&C
    And Submit the form
    Then I see the success page
