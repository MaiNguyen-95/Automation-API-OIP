Feature: Get Order ID and Coupon Code Flow
    @GetFL
    Scenario: Get the Reject farmer document submission with valid token
        Given I am 'valid_token' authenticated on 'farmer_service' service
        And I build dynamic query params with:
            | key                 | value                    |
            | sortBy              | createdAt                |
            | status              | rejected                 |
            | country             | ID                       |
            | submissionDateStart | 2026-02-05T00:53:40.239Z |
            | isActive            | true                     |
        When I send 'GET' request to 'farmerDocumentSubmission' on 'farmer_service' service
        Then The response status should be 200
        Then I extract from response:
            | key | value      |
            | id  | data[0].id |

