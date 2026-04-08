@api
Feature: Create discount
    @createDiscountỎrdcreateDiscountỎrdcreateDiscountỎrdcreateDiscountỎrd
    Scenario: Admin creates discount
        Given I build dynamic headers with:
            | key      | value        |
            | tenantId | {{tenantId}} |
        And I am 'valid_token' authenticated on 'discount_service' service
        And I generate random 4char4digit as "couponCodeValue"
        And I build dynamic payload from "discount/createDiscountOrderLevelMeasuringUnit" with:
            | key        | value               |
            | couponCode | {{couponCodeValue}} |
            | startDate  | {{$now+1h+1m}}      |
        When I send "POST" request to "createDiscount" on "discount_service" service
        Then The response status should be 201
        Then The response should match json "discountService/createDiscount"

    @createDiscountInvalidToken
    Scenario: Admin creates discount
        Given I build dynamic headers with:
            | key      | value        |
            | tenantId | {{tenantId}} |
        And I am '<invalid token>' authenticated on 'discount_service' service
        And I generate random 4char4digit as "couponCodeValue"
        And I build dynamic payload from "discount/createDiscountOrderLevelMeasuringUnit" with:
            | key        | value               |
            | couponCode | {{couponCodeValue}} |
            | startDate  | {{$now+1h+1m}}      |
        When I send "POST" request to "createDiscount" on "discount_service" service
        Then The response status should be 401
        Then The response should match json "<response file>"
        Examples:
            | invalid token | response file                |
            | invalid_token | discountService/invalidToken |
            | no_token      | discountService/unauthorized |
