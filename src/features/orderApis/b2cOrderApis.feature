@api
Feature: API create a B2C order
    # Background:
    #     Given I execute scenario "@GetFCTokenIN" in project "../playwright-cucumber-ts" to get token

    @b2cOrderApisValidTokenAndData
    Scenario: B2C order in all country: The order applies coupon, YC approves the order
        # Background:
        Given I execute scenario "@GetFCTokenAll" in project "../playwright-cucumber-ts" to get token
        Given I am authenticated with token from CSV "<FCTokenPath>"
        And I build dynamic payload from '<orderPayloadFormat>' with:
            | key                             | value |
            | orderDetails[0].orderedQuantity | 2     |
        When I send 'POST' request to 'orders' on '<serviceName>' service
        Then The response status should be 201
        Then I extract from response:
            | variable | path         |
            | orderId  | data.orderId |

        # Get the couponCode
        Given I set path params:
            | key | value       |
            | id  | {{orderId}} |
        And I build dynamic query params with:
            | key    | value |
            | format | json  |
        When I send 'GET' request to 'ordersQrCode' on '<serviceName>' service
        Then The response status should be 200
        Then I extract from response:
            | variable   | path       |
            | couponCode | couponCode |

        # YC (retailer) fulfills order
        Given I am authenticated with token from CSV "<YCTokenPath>"
        And I build dynamic payload from "<fulfillPayloadFormat>" with:
            | key        | value          |
            | couponCode | {{couponCode}} |
        And I set path params:
            | key | value       |
            | id  | {{orderId}} |
        When I send "PATCH" request to "orderID" on "<serviceName>" service
        Then The response status should be 200

        Examples:
            | FCTokenPath                                  | orderPayloadFormat | serviceName            | YCTokenPath                        | fulfillPayloadFormat |
            | ../playwright-cucumber-ts/data/tokenFCIN.csv | order/b2cOrdersIN  | in_marketplace_service | src/data/token/retailerINToken.csv | order/b2cFulfillsIN  |
            | ../playwright-cucumber-ts/data/tokenFCID.csv | order/b2cOrdersID  | id_marketplace_service | src/data/token/retailerIDToken.csv | order/b2cFulfillsID  |
            | ../playwright-cucumber-ts/data/tokenFCTH.csv | order/b2cOrdersTH  | th_marketplace_service | src/data/token/retailerTHToken.csv | order/b2cFulfillsTH  |









