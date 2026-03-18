@api
Feature: API create a B2C order
    # Background:
    #     Given I execute scenario "@GetFCTokenIN" in project "../playwright-cucumber-ts" to get token

    @b2cOrderApisValidTokenAndData
    Scenario: B2C order in all country: The order applies coupon, YC approves the order
        Given I am '<token_status>' authenticated on 'marketplace_service' service for '<countryCode>' country
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

        # # YC (retailer) fulfills order -- third parties
        # Given I am authenticated with token from CSV "<YCTokenPath>"
        # And I build dynamic payload from "<fulfillPayloadFormat>" with:
        #     | key        | value          |
        #     | couponCode | {{couponCode}} |
        # And I set path params:
        #     | key | value       |
        #     | id  | {{orderId}} |
        # When I send "PATCH" request to "orderID" on "<serviceName>" service
        # Then The response status should be 200

        Examples:
            | countryCode | orderPayloadFormat | serviceName            | YCTokenPath                        | fulfillPayloadFormat |
            | in          | order/b2cOrdersIN  | in_marketplace_service | src/data/token/retailerINToken.csv | order/b2cFulfillsIN  |
            | id          | order/b2cOrdersID  | id_marketplace_service | src/data/token/retailerIDToken.csv | order/b2cFulfillsID  |
            | th          | order/b2cOrdersTH  | th_marketplace_service | src/data/token/retailerTHToken.csv | order/b2cFulfillsTH  |

    # Chị Diễm ới
    # ============================================
    # AUTHENTICATION CASES
    # ============================================

    @b2c_order_auth
    Scenario Outline: B2C Create Order - Authentication <token_status>
        Given I am '<token_status>' authenticated on 'marketplace_service' service for '<countryCode>' country
        And I build payload from '<payload file>'
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for '<countryCode>' country
        Then The response status should be <expected_status>

        Examples:
            | token_status  | expected_status | payload file     | countryCode |
            | valid_token   | 201             | b2cCreateOrderIN | in          |
            | invalid_token | 401             | b2cCreateOrderIN | in          |
            | no_token      | 401             | b2cCreateOrderIN | in          |
            | valid_token   | 201             | b2cCreateOrderKE | ke          |
            | invalid_token | 401             | b2cCreateOrderKE | ke          |
            | no_token      | 401             | b2cCreateOrderKE | ke          |

    # ============================================
    # HAPPY CASES - MULTIPLE COUNTRY - ONE PAYLOAD JSON
    # ============================================

    @b2c_order_success
    Scenario Outline: B2C Create Order - <country>
        Given I am 'valid_token' authenticated on 'marketplace_service' service for '<country>' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                               | value           |
            | locationId                        | <locationId>    |
            | sellerShopId                      | <sellerShopId>  |
            | sellerId                          | <sellerId>      |
            | buyerId                           | <buyerId>       |
            | orderDetails[0].productId         | <productId>     |
            | orderDetails[0].productFamilyName | <productFamily> |
            | orderDetails[0].volume            | <volume>        |
            | discountId                        | <discountId>    |
            | discountValue                     | <discountValue> |
            | couponId                          | <couponId>      |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for '<country>' country
        Then The response status should be 201
        And The response should contain:
            | key            | value   |
            | data.orderType | B2C     |
            | data.category  | Product |
        And The response body should contain text: "orderId"

        Examples:
            | country | locationId                           | sellerShopId                         | sellerId                             | buyerId                              | productId                            | productFamily | volume | discountId                           | discountValue | couponId        |
            | in      | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 1      | 5341bce0-14ea-4985-8325-344ae02d41a0 | 10            | Jan2001         |
            | ke      | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 50     | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 500           | KETest12Generic |
            | id      | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 50     | 70195baa-5bd0-4b32-a964-94604830ff2a | 49000         | CoffeeDE        |

    # ============================================
    # HAPPY CASES - ID DELIVERY - Separate flow (pickup vs delivery)
    # ============================================

    @b2c_order_id_delivery
    Scenario: B2C Create Order ID - Delivery
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'id' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                               | value                                |
            | locationId                        | 83cb6faf-20ca-4a6b-85f8-66397b7cfd3d |
            | sellerShopId                      | 1716083a-0b7b-44b5-b04b-0369d583769b |
            | sellerId                          | 4d4b1415-b255-4edb-a216-081a61573999 |
            | buyerId                           | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a |
            | orderDetails[0].productId         | c693ba73-d037-4931-b379-4567c9d2b444 |
            | orderDetails[0].productFamilyName | yaratera                             |
            | orderDetails[0].volume            | 25                                   |
            | discountId                        | 70195baa-5bd0-4b32-a964-94604830ff2a |
            | discountValue                     | 20550                                |
            | couponId                          | CoffeeDE                             |
            | delivery.recipientAddressId       | d8f870f9-88a5-41cc-a298-89728f4431b4 |
            | delivery.fee                      | 5                                    |
            | delivery.estimatedDeliveryDays    | 2                                    |
            | delivery.configId                 | bd7b5a86-1492-4474-a0f6-83b176a63a9e |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'id' country
        Then The response status should be 201
        And The response should contain:
            | key            | value   |
            | data.orderType | B2C     |
            | data.category  | Product |
        And The response body should contain text: "orderId"
        And The response body should contain text: "delivery"

    # ============================================
    # EDGE CASES - - Discount / Coupon / Volume
    # ============================================

    @b2c_order_edge_cases
    Scenario Outline: B2C Create Order - Edge case <case> - <country>
        Given I am 'valid_token' authenticated on 'marketplace_service' service for '<country>' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                               | value           |
            | locationId                        | <locationId>    |
            | sellerShopId                      | <sellerShopId>  |
            | sellerId                          | <sellerId>      |
            | buyerId                           | <buyerId>       |
            | orderDetails[0].productId         | <productId>     |
            | orderDetails[0].productFamilyName | <productFamily> |
            | orderDetails[0].volume            | <volume>        |
            | discountId                        | <discountId>    |
            | discountValue                     | <discountValue> |
            | couponId                          | <couponId>      |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for '<country>' country
        Then The response status should be <expectedStatus>

        Examples:
            | case                   | country | expectedStatus | locationId                           | sellerShopId                         | sellerId                             | buyerId                              | productId                            | productFamily | volume  | discountId                           | discountValue | couponId          |
            | discount_gt_price_in   | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 1       | 5341bce0-14ea-4985-8325-344ae02d41a0 | 9999999       | Jan2001           |
            | discount_gt_price_ke   | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 50      | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 9999999       | KETest12Generic   |
            | discount_gt_price_id   | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 50      | 70195baa-5bd0-4b32-a964-94604830ff2a | 9999999       | CoffeeDE          |
            | negative_discount_in   | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 1       | 5341bce0-14ea-4985-8325-344ae02d41a0 | -100          | Jan2001           |
            | negative_discount_ke   | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 50      | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | -100          | KETest12Generic   |
            | negative_discount_id   | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 50      | 70195baa-5bd0-4b32-a964-94604830ff2a | -100          | CoffeeDE          |
            | zero_discount_in       | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 1       | 5341bce0-14ea-4985-8325-344ae02d41a0 | 0             | Jan2001           |
            | zero_discount_ke       | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 50      | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 0             | KETest12Generic   |
            | zero_discount_id       | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 50      | 70195baa-5bd0-4b32-a964-94604830ff2a | 0             | CoffeeDE          |
            | invalid_coupon_in      | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 1       | 5341bce0-14ea-4985-8325-344ae02d41a0 | 10            | INVALID_COUPON_XY |
            | invalid_coupon_ke      | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 50      | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 500           | INVALID_COUPON_XY |
            | invalid_coupon_id      | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 50      | 70195baa-5bd0-4b32-a964-94604830ff2a | 49000         | INVALID_COUPON_XY |
            | invalid_discount_id_in | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 1       | invalid-uuid                         | 10            | Jan2001           |
            | invalid_discount_id_ke | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 50      | invalid-uuid                         | 500           | KETest12Generic   |
            | invalid_discount_id_id | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 50      | invalid-uuid                         | 49000         | CoffeeDE          |
            | negative_volume_in     | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | -1      | 5341bce0-14ea-4985-8325-344ae02d41a0 | 10            | Jan2001           |
            | negative_volume_ke     | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | -1      | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 500           | KETest12Generic   |
            | negative_volume_id     | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | -1      | 70195baa-5bd0-4b32-a964-94604830ff2a | 49000         | CoffeeDE          |
            | zero_volume_in         | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 0       | 5341bce0-14ea-4985-8325-344ae02d41a0 | 10            | Jan2001           |
            | zero_volume_ke         | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 0       | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 500           | KETest12Generic   |
            | zero_volume_id         | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 0       | 70195baa-5bd0-4b32-a964-94604830ff2a | 49000         | CoffeeDE          |
            | very_large_volume_in   | in      | 400            | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 9999999 | 5341bce0-14ea-4985-8325-344ae02d41a0 | 10            | Jan2001           |
            | very_large_volume_ke   | ke      | 400            | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 9999999 | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 500           | KETest12Generic   |
            | very_large_volume_id   | id      | 400            | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 9999999 | 70195baa-5bd0-4b32-a964-94604830ff2a | 49000         | CoffeeDE          |

    # ============================================
    # HAPPY CASES - MAIN CASES
    # ============================================

    @b2c_order_create_happy
    Scenario Outline: B2C Create Order - <case> - <country>
        Given I am 'valid_token' authenticated on 'marketplace_service' service for '<country>' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                               | value           |
            | locationId                        | <locationId>    |
            | sellerShopId                      | <sellerShopId>  |
            | sellerId                          | <sellerId>      |
            | buyerId                           | <buyerId>       |
            | orderDetails[0].productId         | <productId>     |
            | orderDetails[0].productFamilyName | <productFamily> |
            | orderDetails[0].orderedQuantity   | <quantity>      |
            | orderDetails[0].volume            | <volume>        |
            | discountId                        | <discountId>    |
            | discountValue                     | <discountValue> |
            | couponId                          | <couponId>      |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for '<country>' country
        Then The response status should be 201
        And The response should contain:
            | key            | value   |
            | data.orderType | B2C     |
            | data.category  | Product |
        And The response body should contain text: "orderId"

        Examples:
            | case            | country | locationId                           | sellerShopId                         | sellerId                             | buyerId                              | productId                            | productFamily | quantity | volume | discountId                           | discountValue | couponId        |
            | default_in      | in      | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 1        | 1      | 5341bce0-14ea-4985-8325-344ae02d41a0 | 10            | Jan2001         |
            | default_ke      | ke      | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 1        | 50     | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 500           | KETest12Generic |
            | default_id      | id      | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 1        | 50     | 70195baa-5bd0-4b32-a964-94604830ff2a | 49000         | CoffeeDE        |
            | override_qty_in | in      | 1a82020c-56fd-452f-b2c8-6da9ece8ca4c | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 10f16b0a-811a-45a5-aea8-709c31eebd60 | 3414cc84-3c9a-4310-9bdf-be2547dcafa3 | 12cd52ee-2395-4626-9b00-f5685e99c0f3 | yaratera      | 5        | 10     | 5341bce0-14ea-4985-8325-344ae02d41a0 | 10            | Jan2001         |
            | override_qty_ke | ke      | 2b8ee2c8-984d-4457-a8a6-ec9b08aa4cfb | 0cfa52ba-2295-4110-945a-ab8bd20ec935 | 9b756e3b-5ebe-4b9a-9224-a951874cb1c4 | d7a60390-b2d0-4907-939f-be291491f42e | a2288de4-e644-6eed-bc0e-fd0107881ef5 | yaramila      | 5        | 10     | 16ce122f-d0a1-4c53-ac5a-9c0aab25be59 | 500           | KETest12Generic |
            | override_qty_id | id      | c93fbd61-2bb3-4cb8-8061-97f9f99f5189 | 4b465217-0aa1-49e8-982d-f2482b4fbcaf | 69ef5a31-0dd7-4713-88ac-5ff8dca56740 | 01baf39b-c5d7-4e1c-b09c-c6c2338e5d9a | 108ad601-c3fa-43ae-a7ca-0cb036405886 | yaramila      | 5        | 10     | 70195baa-5bd0-4b32-a964-94604830ff2a | 49000         | CoffeeDE        |

    @b2c_order_create_multiple_items
    Scenario: B2C Create Order - Multiple order details
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                               | value                                |
            | orderDetails[0].orderedQuantity   | 2                                    |
            | orderDetails[1].productId         | b1ef4be1-3046-4173-a701-f7aed3056381 |
            | orderDetails[1].orderedQuantity   | 3                                    |
            | orderDetails[1].productFamilyName | yaravita                             |
            | orderDetails[1].volume            | 10                                   |
            | orderDetails[1].metric            | L                                    |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 201
        And The array "orderDetails" should have length greater than 1

    # ============================================
    # EDGE CASES - Missing required fields
    # ============================================

    @b2c_order_missing_required
    Scenario Outline: B2C Create Order - Missing required field <field>
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key     | value   |
            | <field> | <value> |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 503
        And The response body should contain text: "<field>"

        Examples:
            | field      | value |
            | locationId |       |
            | sellerId   |       |
            | buyerId    |       |
            | orderType  |       |
            | category   |       |

    # ============================================
    # EDGE CASES - Invalid UUID
    # ============================================

    @b2c_order_invalid_uuid
    Scenario Outline: B2C Create Order - Invalid UUID for <field>
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key     | value        |
            | <field> | invalid-uuid |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400

        Examples:
            | field        |
            | locationId   |
            | sellerShopId |
            | sellerId     |

    # ============================================
    # EDGE CASES - Invalid enum values
    # ============================================

    @b2c_order_invalid_enums
    Scenario Outline: B2C Create Order - Invalid <field> value
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key     | value   |
            | <field> | INVALID |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400

        Examples:
            | field     |
            | orderType |
            | category  |
            | source    |

    # ============================================
    # EDGE CASES - Invalid orderDetails values
    # ============================================

    @b2c_order_invalid_quantity
    Scenario Outline: B2C Create Order - Invalid orderedQuantity <case>
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                             | value      |
            | orderDetails[0].orderedQuantity | <quantity> |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400

        Examples:
            | case     | quantity |
            | zero     | 0        |
            | negative | -1       |

    @b2c_order_invalid_volume
    Scenario Outline: B2C Create Order - Invalid volume <case>
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                    | value    |
            | orderDetails[0].volume | <volume> |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400

        Examples:
            | case     | volume |
            | zero     | 0      |
            | negative | -5     |

    @b2c_order_invalid_metric
    Scenario: B2C Create Order - Invalid metric
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                    | value   |
            | orderDetails[0].metric | INVALID |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400

    @b2c_order_invalid_product_id
    Scenario: B2C Create Order - Invalid productId in orderDetails
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key                       | value        |
            | orderDetails[0].productId | invalid-uuid |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400

    # ============================================
    # EDGE CASES - Empty / missing body
    # ============================================

    @b2c_order_empty_order_details
    Scenario: B2C Create Order - Empty orderDetails array
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        And I build dynamic payload from "b2cCreateOrder" with:
            | key          | value |
            | orderDetails | []    |
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400

    @b2c_order_empty_body
    Scenario: B2C Create Order - Empty request body
        Given I am 'valid_token' authenticated on 'marketplace_service' service for 'in' country
        When I send 'POST' request to 'b2cCreateOrder' on 'marketplace_service' service for 'in' country
        Then The response status should be 400









