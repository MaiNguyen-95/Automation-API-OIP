@api
Feature: API create a B2C order
    Background:
        Given I execute scenario "@GetFCTokenIN" in project "../playwright-cucumber-ts" to get token

    @b2cOrderApisvalidTokenAndData
    Scenario: Validate the token is invalid
        Given I am authenticated with token from CSV "../playwright-cucumber-ts/data/token.csv"
        And I build dynamic payload from 'b2cOrdersIN' with:
            | key                             | value |
            | orderDetails[0].orderedQuantity | 2     |
        When I send 'POST' request to 'orders' on 'marketplace_service' service
        Then The response status should be 201
        And I save response body as "responseBody"
        Then I extract from response:
            | variable | path         |
            | orderId  | data.orderId |