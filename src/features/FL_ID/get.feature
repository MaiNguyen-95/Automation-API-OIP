Feature: Get Order ID and Coupon Code Flow
    @GetFL
    Scenario: Validate farmer document submission with valid token
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
# And The response should match json "farmerService/farmerDocumentSubmission"
# And I save response as "farmerService/farmerDocumentSubmission"
# Sau đó mới thực hiện so sánh
# And The response should match json "farmerService/farmerDocumentSubmission"
