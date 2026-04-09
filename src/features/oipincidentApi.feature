Feature: OIP API INCIDENT

    # incident page
    @oipvalidincident
    Scenario: valid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I set path params:
            | key | value                                |
            | id  | 445f0d1f-0be4-4830-b08b-9e8fa45c689f |
        When I send "GET" request to "incidentID" on "oip_service" service
        Then The response status should be 400
            And I save response body as "responseBody"

    @oipinvalidincident
    Scenario: valid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I set path params:
            | key | value  |
            | id  | 123abb |
        When I send "GET" request to "incidentID" on "oip_service" service
        Then The response status should be 400
            And I save response body as "responseBody"


    @oipinvalidtokenincident
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am '<token>' authenticated on 'oip_service' service is
            And I set path params:
            | key | value                                |
            | id  | 445f0d1f-0be4-4830-b08b-9e8fa45c689f |
        When I send "GET" request to "incidentID" on "oip_service" service
        Then The response status should be 401
            And I save response body as "responseBody"
        Examples:
            | token         |
            | invalid_token |
            | no_token      |



