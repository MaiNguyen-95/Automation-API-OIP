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

    @b2cAODatainMPServiceInvalidSpecificField
    Scenario: B2C Assisted order in IN country: invalid value
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key      | value |
            | category | test  |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 400
        Then The response should match json "orders/b2cAssistedOrderErrorCategory"
        Examples:
            | orderPayloadFormat       | serviceName            | field       | response                                |
            | order/b2cAssistedOrderIN | in_marketplace_service | category    | orders/b2cAssistedOrderErrorCategory    |
            | order/b2cAssistedOrderIN | in_marketplace_service | paymentType | orders/b2cAssistedOrderErrorPaymentType |

    @b2cAODatainMPServiceBussinessRulesIGONRE
    # =Scenario 1: SelerId and SellerShopId are not belong to one -> IGNORE
    # =Scenario 2: BuyerId is not existed -> IGNORE
    # =Scenario 3: productFamilyName and productId are not belong to one -> IGNORE
    # =Scenario 4: form and productId are not belong to one -> IGNORE
    # =Scenario 5: volume and productId are not belong to one -> IGNORE
    # =Scenario 6: metric and productId are not belong to one -> IGNORE
    # =Scenario 7: action is invalid data -> IGNORE
    Scenario: B2C Assisted order in IN country: Business rules
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key     | value         |
            | <field> | <field value> |
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
            | orderPayloadFormat       | serviceName            | response file                    | field                             | field value                          |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | sellerId                          | b10cf47a-f4f3-425e-b844-c53084d4b0f6 |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | buyerId                           | aada3715-89f7-41a2-a71b-5717c06df002 |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderDetails[0].productFamilyName | yarate2ra                            |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderDetails[0].form              | test                                 |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | orderDetails[0].volume            | 50                                   |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | orderDetails[0].metric            | L                                    |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorMsg  | action                            | test                                 |

    @b2cAODatainMPServiceBussinessRulesValidate
    # =Scenario 1: SellerShopId is not a shop
    # =Scenario 2: productId is not a product
    # =Scenario 3: productId and sellerShopID are not belong to one
    Scenario: B2C Assisted order in IN country: Business rules
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "<orderPayloadFormat>" with:
            | key     | value         |
            | <field> | <field value> |
        When I send "POST" request to "assistedOrderMP" on "<serviceName>" service
        Then The response status should be 400
        Then The response should match json "<response file>" with:
            | key         | value           |
            | <key field> | <error message> |

        Examples:
            | orderPayloadFormat       | serviceName            | response file                    | field                     | field value                          | key field             | error message                                                                                                              |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | sellerShopId              | b10cf47a-f4f3-425e-b844-c53084d4b0f6 | error.responseMessage | No shop found with this information                                                                                        |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderDetails[0].productId | eb8a2896-46fb-4f0c-82d7-aaaaaae06e86 | error.responseMessage | Products [eb8a2896-46fb-4f0c-82d7-aaaaaae06e86] not found from shop 608b7286-0df6-4df3-8d1d-c167e46b286e or ProductCatalog |
            | order/b2cAssistedOrderIN | in_marketplace_service | orders/b2cAssistedOrderErrorBody | orderDetails[0].productId | 3ccb4b1c-6578-4617-a3e3-5c588545d54a | error.responseMessage | Products [3ccb4b1c-6578-4617-a3e3-5c588545d54a] not found from shop 608b7286-0df6-4df3-8d1d-c167e46b286e or ProductCatalog |


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
