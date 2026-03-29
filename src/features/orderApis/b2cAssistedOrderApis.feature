@api
Feature: API create a B2C Assisted order
    @b2cAODatainMPServiceValidToken
    Scenario: B2C Assisted order in IN country: Valid token
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key                             | value |
            | orderDetails[0].orderedQuantity | 2     |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 201
        Then The response should contain:
            | key    | value   |
            | status | SUCCESS |
        Then I extract from response:
            | variable      | path         |
            | orderId       | data.id      |
            | numberOrderID | data.orderId |

        # Confirm the order is created and fulfiledd status
        Given I set path params:
            | key | value       |
            | id  | {{orderId}} |
        When I send "GET" request to "getOrderID" on "<serviceName>" service
        Then The response status should be 200
        Then The response should match json "orders/getOrderIN" with:
            | key              | value             |
            | data.orderNumber | {{numberOrderID}} |
            | data.orderDate   | IGNORE            |
            | totalPoints      | IGNORE            |


        Examples:
            | orderPayloadFormat       | serviceName            |
            | order/b2cAssistedOrderIN | in_marketplace_service |

    @b2cAODatainMPServiceInvalidToken
    Scenario: B2C Assisted order in IN country: Invalid token
        Given I am '<invalid_token>' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key                             | value |
            | orderDetails[0].orderedQuantity | 2     |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 400
        Then The response should contain data:
            | key           | value       |
            | status        | FAILURE     |
            | error.message | Bad Request |

        Examples:

            | invalid_token | orderPayloadFormat       | serviceName            |
            | invalid_token | order/b2cAssistedOrderIN | in_marketplace_service |
            | no_token      | order/b2cAssistedOrderIN | in_marketplace_service |

    @b2cAODatainMPServiceMissedRequiredFields
    Scenario: B2C Assisted order in IN country: Invalid token
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key     | value |
            | <field> | null  |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 400
        Examples:
            | orderPayloadFormat       | serviceName            | field        |
            | order/b2cAssistedOrderIN | in_marketplace_service | sellerId     |
            | order/b2cAssistedOrderIN | in_marketplace_service | sellerShopId |

    @b2cAssistedOrderApisValidTokenAndDatainLoyaltyService
    Scenario: B2C Assisted order in TZ, TH country: The order applies coupon, YC approves the order
        Given I am "valid_token" authenticated on "<serviceName>" service
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key                             | value |
            | orderDetails[0].orderedQuantity | 2     |
        When I send "POST" request to "assistedOrderLS" on "<serviceName>" service
        Then The response status should be 200
        Then I extract from response:
            | variable | path |
            | orderId  | id   |
        Examples:
            | orderPayloadFormat       | serviceName        |
            | order/b2cAssistedOrderTZ | tz_loyalty_service |
            | order/b2cAssistedOrderTH | th_loyalty_service |
            | order/b2cAssistedOrderID | id_loyalty_service |
            | order/b2cAssistedOrderKE | ke_loyalty_service |
# valid data
# authorization
# required: null, empty
# Biz: data limitation,
# data type
