Feature: Get Order ID and Coupon Code Flow
    @GetCouponCode
    Scenario Outline: B2C order in a country: Place an order, then get couponCode
        # Authenticate with the token extracted from the current CSV row
        Given I authenticate using token '<token>'

        # Build dynamic payload to place an order
        And I build dynamic payload from 'order/b2cOrdersID' with:
            | key                             | value |
            | orderDetails[0].orderedQuantity | 2     |
        When I send 'POST' request to 'orders' on 'id_marketplace_service' service
        Then The response status should be 201

        # Extract the orderId from the response to environment variables context
        Then I extract from response:
            | variable | path         |
            | orderId  | data.orderId |

        # Use the extracted orderId to retrieve the couponCode
        Given I set path params:
            | key | value       |
            | id  | {{orderId}} |
        And I build dynamic query params with:
            | key    | value |
            | format | json  |
        When I send 'GET' request to 'ordersQrCode' on 'id_marketplace_service' service
        Then The response status should be 200

        # Extract the couponCode
        Then I extract from response:
            | variable   | path       |
            | couponCode | couponCode |

        # Finally, update the tokens locally back to the CSV at EXACT ROW
        And I save "orderId" and "couponCode" back to CSV "src/data/csvData/tokenFCID.csv" for token '<token>'

        # Note: Using the generateB2CFeature.ts script will regenerate the examples dynamically
        Examples:
            | token             |
            | your_token_demo_1 |
            | your_token_demo_2 |
