
@api
Feature: API create a B2C Assisted order
    @b2cAssistedOrderApisValidTokenAndData
    Scenario: B2C Assisted order in all country: The order applies coupon, YC approves the order
        Given I am '<token_status>' authenticated on 'marketplace_service' service for '<countryCode>' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key                             | value |
            | orderDetails[0].orderedQuantity | 2     |
        When I send "POST" request to "<assisteOrderEndpoint>" on "<serviceName>" service
        Then The response status should be <statusCode>
        Then I extract from response:
            | variable | path      |
            | orderId  | <orderId> |

        Examples:
            | countryCode | assisteOrderEndpoint | orderPayloadFormat       | serviceName            | statusCode | orderId |
            | in          | assistedOrder        | order/b2cAssistedOrderIN | in_marketplace_service | 201        | data.id |
# | src/data/token/retailerTHToken.csv           | assistedOrderTH      | order/b2cAssistedOrderTH | th_loyalty_service     | 200        | id      |
