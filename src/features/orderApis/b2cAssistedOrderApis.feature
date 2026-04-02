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
        Then The response status should be 401
        Then The response should match json "orders/invalidToken"

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
        Then The response should match json "<response file>" with:
            | key         | value           |
            | <key field> | <error message> |
        Examples:
            | orderPayloadFormat       | serviceName            | response file                    | field                             | key field             | error message                                                     |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | sellerId                          | msg[0]                | should be string in sellerId                                      |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | sellerShopId                      | msg[0]                | should be string in sellerShopId                                  |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | source                            | error.responseMessage | source: Invalid literal value, expected "RETAILER_ASSISTED"       |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderType                         | error.responseMessage | orderType: Invalid literal value, expected "B2C"                  |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | orderDetails                      | msg[0]                | should be array in orderDetails                                   |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | orderDetails[0].productId         | msg[0]                | should be string in orderDetails[0].productId                     |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | orderDetails[0].orderedQuantity   | msg[0]                | should be number in orderDetails[0].orderedQuantity               |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderDetails[0].productFamilyName | error.responseMessage | orderDetails[0].productFamilyName: Expected string, received null |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | fulfilledMRP                      | msg[0]                | should be number in fulfilledMRP                                  |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | paymentType                       | msg[0]                | should be string in paymentType                                   |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | discountId                        | msg[0]                | should be string in discountId                                    |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | discountValue                     | error.responseMessage | discountValue: Expected number, received null                     |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | couponId                          | msg[0]                | should be string in couponId                                      |

    @b2cAODatainMPServiceInvalidData
    Scenario: B2C Assisted order in IN country: invalid value
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key     | value |
            | <field> | test  |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 400
        Then The response should match json "<response file>" with:
            | key         | value           |
            | <key field> | <error message> |
        Examples:
            | orderPayloadFormat       | serviceName            | response file                    | field                           | key field             | error message                                                                                                                |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | sellerId                        | msg[0]                | should match format "uuid" in sellerId                                                                                       |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | sellerShopId                    | msg[0]                | should match format "uuid" in sellerShopId                                                                                   |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | source                          | error.responseMessage | source: Invalid literal value, expected "RETAILER_ASSISTED"                                                                  |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderType                       | error.responseMessage | orderType: Invalid literal value, expected "B2C"                                                                             |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderDetails[0].productId       | error.responseMessage | Product ID must be UUID                                                                                                      |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | orderDetails[0].orderedQuantity | msg[0]                | should be number in orderDetails[0].orderedQuantity                                                                          |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderDetails[0].volume          | error.responseMessage | orderDetails[0].volume: Expected number, received string                                                                     |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | fulfilledMRP                    | msg[0]                | should be number in fulfilledMRP                                                                                             |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | discountId                      | msg[0]                | should match format "uuid" in discountId                                                                                     |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | discountValue                   | error.responseMessage | discountValue: Expected number, received string                                                                              |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | locationId                      | error.responseMessage | locationId: Invalid uuid                                                                                                     |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/responsefail              | couponId                        | error.responseMessage | Failed to apply coupon test and discount c8f1ad97-eb65-4959-9fe3-df89397b9f1f: 1019: Add more quantity to apply this coupon. |

    @b2cAODatainMPServiceInvalidCategoryValue
    Scenario: B2C Assisted order in IN country: invalid value
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key      | value |
            | category | test  |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 400
        Then The response should match json "orders/b2cAssistedOrderErrorCategory"
        Examples:
            | orderPayloadFormat       | serviceName            |
            | order/b2cAssistedOrderIN | in_marketplace_service |

    @b2cAODatainMPServiceInvalidPaymentTypeValue
    Scenario: B2C Assisted order in IN country: invalid value
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key         | value |
            | paymentType | test  |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 400
        Then The response should match json "orders/b2cAssistedOrderErrorPaymentType"
        Examples:
            | orderPayloadFormat       | serviceName            |
            | order/b2cAssistedOrderIN | in_marketplace_service |


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
