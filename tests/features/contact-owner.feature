@watch
Feature: Contact owner functionality

  As a human
  I want to see if I can send a message to the owner of a car
  So I can contact them

  Scenario: Send message to owner
    Given I visit the car list page
    And I click on any car
    And I click the contact seller button
    When I fill the contact form
    And submit the form
    Then I expect a success message

  Scenario: Send message to owner errors
    Given I visit the car list page
    And I click on any car
    And I click the contact seller button
    When I fill the contact form
    And "name" is not filled
    And submit the form
    Then I see an error in the form
