@api
Feature: API validation
    @invalidToken
    Scenario: Validate he token is invalid
        Given I build dynamic headers with:
            | key      | value        |
            | tenantId | {{tenantId}} |
        Given I am '<token>' authenticated on 'discount_service' service
        And I set path params:
            | key | value   |
            | id  | uuid123 |
        # And I build dynamic query params with:
        #     | key  | value |
        #     | page | 1     |
        # When I send "GET" request to "discountID"
        When I send 'GET' request to 'discountID' on 'discount_service' service
        Then The response status should be 401
        Examples:
            | token         |
            | invalid_token |
            | no_token      |

    @validTokenGet
    Scenario: Validate he token is valid
        Given I build dynamic headers with:
            | key      | value        |
            | tenantId | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'discount_service' service
        And I set path params:
            | key | value                                |
            | id  | 93d76a54-7ad8-49d1-a731-3f5b5f45c85e |
        When I send 'GET' request to 'discountID' on 'discount_service' service
        Then The response status should be 200
        And The response should contain:
            | key                               | value        |
            | data.name                         | B2B discount |
            | data.isEligibleForLoyaltyCampaign | false        |

    @validTokenPost
    Scenario: Validate he token is valid
        Given I build dynamic headers with:
            | key      | value        |
            | tenantId | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'discount_service' service
        # And I set path params:
        #     | key | value                                |
        #     | id  | 93d76a54-7ad8-49d1-a731-3f5b5f45c85e |
        # And I build dynamic query params with:
        #     | key  | value |
        #     | page | 1     |
        And I build dynamic payload from 'discount/createDiscountOrderLevelMeasuringUnit' with:
            | key                                    | value    |
            | name                                   | QA_MA    |
            | messageLocalised.kn                    | null     |
            | products[0].discountValueAndType.value | 5        |
            | couponCode                             | test2499 |
        When I send 'POST' request to 'createDiscount' on 'discount_service' service
        Then The response status should be 201
        And The response should contain:
            | key     | value          |
            | message | Create success |
        And The response should match json "discountService/createDiscount"

# Scenario Outline: API validation
#     Given I got access token is '<token_status>' with role '<role>'
#     When I send "<method>" to "<path>" with payload "<payload_name>"
# Then response status is "<expectation_status>"
# And response body has to match schema "<success_schema>"
# And response has to error code "<error_code>"
# Examples:
#     | token_status | role | method | path         | payload_name   |
#     | valid_token  | bo   | get    | productsList | createCustomer |

# Scenario: Validate products list response schema
#     Given I build dynamic headers with:
#         | key      | value        |
#         | tenantId | {{tenantId}} |
#     Given I am authenticated as 'user'
#     And I set path params:
#         | key  | value   |
#         | uuid | uuid123 |
#         | id   | 123     |
#     And I build dynamic query params with:
#         | key  | value |
#         | page | 1     |
#     When I send "GET" request to "discountID"
#     Then The response status should be 404
#     And I save response body as "responseBody"
# And response matches schema "productsList"

# Scenario: Get products list via dynamic API
# When I send "GET" request to "productsList"
#     Then response status should be 200
#     And I save response body as "responseBody"

# ============================================
# TEST buildPayload FUNCTION - TEST CASES
# ============================================
# Function buildPayload has 3 main scenarios:
# 1. Load from JSON file (payloadName) → return payload from file
# 2. Load from file + override with table (payloadName + rows) → merge and override
# 3. Use table only (rows) → build payload from table
# ============================================

# ============================================
# CASE 1: Override 1 simple field from base file
# ============================================
# File: searchProduct.json has {"search_product": "top"}
# Override: change "top" to "tshirt"
# Result: {"search_product": "tshirt"}
# ============================================
# @payload
# Scenario: Override single field - Change search_product from top to tshirt
#     Given I build dynamic payload from "createProduct" with:
#         | key                                    | value   |
#         | name                                   | QA_MA   |
#         | messageLocalised.kn                    | kn test |
#         | products[0].discountValueAndType.value | 5       |
#When I send "POST" request to "searchProduct"
#Then The response status should be 200
#And I save response body as "responseBody"

# # ============================================
# # CASE 2: Override multiple fields from base file
# # ============================================
# # File: verifyLogin.json has {"email": "test@example.com", "password": "password123"}
# # Override: change both email and password
# # Result: {"email": "newuser@test.com", "password": "newpass123"}
# # ============================================
# Scenario: Override multiple fields - Change email and password
#     Given I build dynamic payload from "verifyLogin" with:
#         | key      | value            |
#         | email    | newuser@test.com |
#         | password | newpass123       |
#     When I send "POST" request to "verifyLogin"
#     Then response status should be 200

# # ============================================
# # CASE 3: Override with dynamic values ({{var}})
# # ============================================
# # File: verifyLogin.json has default email and password
# # Override: use {{email}} and {{pass}} from shared values
# # Result: payload will resolve {{email}} and {{pass}} to real values
# # ============================================
# Scenario: Override with dynamic values using {{var}} syntax
#     Given I set shared values:
#         | key   | value                |
#         | email | testuser@example.com |
#         | pass  | mypassword123        |
#     Given I build dynamic payload from "verifyLogin" with:
#         | key      | value     |
#         | email    | {{email}} |
#         | password | {{pass}}  |
#     When I send "POST" request to "verifyLogin"
#     Then response status should be 200

# # ============================================
# # CASE 4: Override partial fields in complex payload
# # ============================================
# # File: createAccount.json has multiple fields (name, email, address, etc.)
# # Override: change only specific fields (email, name, city)
# # Other fields remain unchanged from the file
# # ============================================
# Scenario: Override partial fields in complex payload - Keep other fields from file
#     Given I build dynamic payload from "createAccount" with:
#         | key   | value               |
#         | email | jane.smith@test.com |
#         | name  | Jane Smith          |
#         | city  | San Francisco       |
#     When I send "POST" request to "createAccount"
#     Then response status should be 201

# # ============================================
# # CASE 5: Override many fields in complex payload
# # ============================================
# # File: createAccount.json contains full information
# # Override: change multiple fields at once
# # ============================================
# Scenario: Override many fields in complex payload
#     Given I build dynamic payload from "createAccount" with:
#         | key           | value            |
#         | email         | updated@test.com |
#         | name          | Updated Name     |
#         | firstname     | Updated          |
#         | lastname      | Name             |
#         | company       | New Company      |
#         | address1      | 456 New Street   |
#         | city          | New York         |
#         | mobile_number | 9876543210       |
#     When I send "POST" request to "createAccount"
#     Then response status should be 201

# # ============================================
# # CASE 6: Override with dynamic values from previous response
# # ============================================
# # Step 1: Get data from previous API
# # Step 2: Use that data to override payload
# # ============================================
# Scenario: Override using data from previous API response
#     When I send "GET" request to "productsList"
#     Then response status should be 200
#     And I save response path "$.products[0].category.category" as "productCategory"
#     Given I build dynamic payload from "searchProduct" with:
#         | key            | value               |
#         | search_product | {{productCategory}} |
#     When I send "POST" request to "searchProduct"
#     Then response status should be 200

# # ============================================
# # CASE 7: Override nested fields (if payload has nested structure)
# # ============================================
# # File: updateAccount.json has flat fields
# # Override: can override any field
# # ============================================
# Scenario: Override fields in update account payload
#     Given I set shared values:
#         | key   | value             |
#         | email | existing@test.com |
#     Given I build dynamic payload from "updateAccount" with:
#         | key      | value           |
#         | email    | {{email}}       |
#         | company  | Updated Company |
#         | address1 | 789 Updated Ave |
#         | city     | Chicago         |
#     When I send "PUT" request to "updateAccount"
#     Then response status should be 200

# # ============================================
# # CASE 8: Override nested fields using dot notation
# # ============================================
# # If payload has nested structure like {"user": {"profile": {"name": "John"}}}
# # Can override by "user.profile.name" = "Jane"
# # Function setNestedValue supports dot notation and bracket notation
# # ============================================
# Scenario: Override nested field using dot notation (if payload has nested structure)
#     Given I build dynamic payload from "createAccount" with:
#         | key               | value      |
#         | user.profile.name | Jane Smith |
#         | address.city      | New York   |
#     When I send "POST" request to "createAccount"
#     Then response status should be 201

# # ============================================
# # CASE 9: Override with boolean and number values
# # ============================================
# # Test with different data types (string, number, boolean)
# # Function parseDynamicValue will automatically convert:
# # - "true" → boolean true
# # - "false" → boolean false
# # - "123" → number 123
# # - "null" → null
# # ============================================
# Scenario: Override with different data types (string, number, boolean)
#     Given I build dynamic payload from "searchProduct" with:
#         | key            | value |
#         | search_product | jean  |
#     When I send "POST" request to "searchProduct"
#     Then response status should be 200
