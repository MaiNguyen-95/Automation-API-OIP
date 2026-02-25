@api
Feature: API validation
    # Scenario Outline: API validation
    #     Given I got access token is '<token_status>' with role '<role>'
    #     When I send "<method>" to "<path>" with payload "<payload_name>"
    # Then response status is "<expectation_status>"
    # And response body has to match schema "<success_schema>"
    # And response has to error code "<error_code>"
    # Examples:
    #     | token_status | role | method | path         | payload_name   |
    #     | valid_token  | bo   | get    | productsList | createCustomer |

    @test
    Scenario: Validate products list response schema
        Given I build dynamic headers with:
            | key      | value        |
            | tenantId | {{tenantId}} |
        Given I am authenticated as 'valid_token'
        And I set path params:
            | key  | value   |
            | uuid | uuid123 |
            | id   | 123     |
        And I build dynamic query params with:
            | key  | value |
            | page | 1     |
        When I send "GET" request to "discountID"
        Then The response status should be 404
        And I save response body as "responseBody"
# And response matches schema "productsList"

# Scenario: Get products list via dynamic API
# When I send "GET" request to "productsList"
#     Then response status should be 200
#     And I save response body as "responseBody"

# ============================================
# TEST buildPayload FUNCTION - CÁC TRƯỜNG HỢP
# ============================================
# Function buildPayload có 3 trường hợp chính:
# 1. Load từ file JSON (payloadName) → return payload từ file
# 2. Load từ file + override bằng table (payloadName + rows) → merge và override
# 3. Chỉ dùng table (rows) → build payload từ table
# ============================================

# ============================================
# TRƯỜNG HỢP 1: Override 1 field đơn giản từ file base
# ============================================
# File: searchProduct.json có {"search_product": "top"}
# Override: thay "top" thành "tshirt"
# Kết quả: {"search_product": "tshirt"}
# ============================================
# Scenario: Override single field - Change search_product from top to tshirt
#     Given I build dynamic payload from "searchProduct" with:
#         | key            | value  |
#         | search_product | tshirt |
#     When I send "POST" request to "searchProduct"
#     Then response status should be 200
#     And I save response body as "responseBody"

# # ============================================
# # TRƯỜNG HỢP 2: Override nhiều fields từ file base
# # ============================================
# # File: verifyLogin.json có {"email": "test@example.com", "password": "password123"}
# # Override: thay cả email và password
# # Kết quả: {"email": "newuser@test.com", "password": "newpass123"}
# # ============================================
# Scenario: Override multiple fields - Change email and password
#     Given I build dynamic payload from "verifyLogin" with:
#         | key      | value            |
#         | email    | newuser@test.com |
#         | password | newpass123       |
#     When I send "POST" request to "verifyLogin"
#     Then response status should be 200

# # ============================================
# # TRƯỜNG HỢP 3: Override với dynamic values ({{var}})
# # ============================================
# # File: verifyLogin.json có email và password mặc định
# # Override: dùng {{email}} và {{pass}} từ shared values
# # Kết quả: payload sẽ resolve {{email}} và {{pass}} thành giá trị thực
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
# # TRƯỜNG HỢP 4: Override một số fields trong payload phức tạp
# # ============================================
# # File: createAccount.json có nhiều fields (name, email, address, etc.)
# # Override: chỉ thay đổi một số fields (email, name, city)
# # Các fields khác giữ nguyên từ file
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
# # TRƯỜNG HỢP 5: Override nhiều fields trong payload phức tạp
# # ============================================
# # File: createAccount.json có đầy đủ thông tin
# # Override: thay đổi nhiều fields cùng lúc
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
# # TRƯỜNG HỢP 6: Override với dynamic values từ response trước
# # ============================================
# # Bước 1: Lấy dữ liệu từ API trước
# # Bước 2: Dùng dữ liệu đó để override payload
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
# # TRƯỜNG HỢP 7: Override nested fields (nếu payload có nested structure)
# # ============================================
# # File: updateAccount.json có các fields phẳng
# # Override: có thể override bất kỳ field nào
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
# # TRƯỜNG HỢP 8: Override nested fields với dot notation
# # ============================================
# # Nếu payload có nested structure như {"user": {"profile": {"name": "John"}}}
# # Có thể override bằng "user.profile.name" = "Jane"
# # Function setNestedValue hỗ trợ dot notation và bracket notation
# # ============================================
# Scenario: Override nested field using dot notation (if payload has nested structure)
#     Given I build dynamic payload from "createAccount" with:
#         | key               | value      |
#         | user.profile.name | Jane Smith |
#         | address.city      | New York   |
#     When I send "POST" request to "createAccount"
#     Then response status should be 201

# # ============================================
# # TRƯỜNG HỢP 9: Override với giá trị boolean và number
# # ============================================
# # Test với các kiểu dữ liệu khác nhau (string, number, boolean)
# # Function parseDynamicValue sẽ tự động convert:
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
