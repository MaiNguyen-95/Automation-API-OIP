@api
Feature: Create discount
    @createDiscount
    Scenario: Admin creates discount
        Given I build dynamic headers with:
            | key      | value        |
            | tenantId | {{tenantId}} |
        And I am 'valid_token' authenticated on 'discount_service' service
        And I generate random 4char4digit as "couponCodeValue"
        And I build dynamic payload from "discount/createDiscountOrderLevelMeasuringUnit" with:
            | key        | value               |
            | couponCode | {{couponCodeValue}} |
        When I send "POST" request to "createDiscount" on "discount_service" service
        Then The response status should be 201
# Then I extract from response:
#     | variable | path      |
#     | orderId  | <orderId> |