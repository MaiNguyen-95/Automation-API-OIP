Feature: OIP API DASHBOARD
    # choose tenant
    @tenantvalid
    Scenario: Valid request
        Given I build dynamic headers with:
            | key         | value      |
            | x-tenant-id | <tenantId> |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 200
            And I save response body as "responseBody"
        Examples:
            | tenantId                             | timeScale |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 1h        |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 24h       |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 7d        |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 30d       |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 1h        |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 24h       |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 7d        |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 30d       |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 1h        |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 24h       |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 7d        |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 30d       |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 1h        |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 24h       |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 7d        |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 30d       |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 1h        |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 24h       |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 7d        |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 30d       |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 1h        |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 24h       |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 7d        |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 30d       |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 1h        |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 24h       |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 7d        |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 30d       |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 1h        |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 24h       |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 7d        |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 30d       |


    @tenantinvalidtimescale
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value      |
            | x-tenant-id | <tenantId> |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value |
            | timeScale | 32h   |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 400
            And I save response body as "responseBody"
        Examples:
            | tenantId                             |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 |
            | 74336175-95c1-4daf-811d-c7ce180f6235 |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b |
            | 1acc963f-a736-4235-9baa-e3c581514f19 |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed |

    @tenantinvalidtenant
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value  |
            | x-tenant-id | 112145 |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 400
            And I save response body as "responseBody"
        Examples:
            | timeScale |
            | 1h        |
            | 24h       |
            | 7d        |
            | 30d       |

    @tenantinvalidtoken
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am '<token>' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 401
            And I save response body as "responseBody"
        Examples:
            | token         |
            | invalid_token |
            | no_token      |


    # module detail
    @oipvalid
    Scenario: Valid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
            | status    | <status>    |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 200
            And I save response body as "responseBody"
        Examples:
            | timeScale | status   |
            | 1h        | passing  |
            | 24h       | passing  |
            | 7d        | passing  |
            | 30d       | passing  |
            | 1h        | degraded |
            | 24h       | degraded |
            | 7d        | degraded |
            | 30d       | degraded |
            | 1h        | failed   |
            | 24h       | failed   |
            | 7d        | failed   |
            | 30d       | failed   |


    @oipinvalidtimescale
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value    |
            | timeScale | 32h      |
            | status    | <status> |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 400
            And I save response body as "responseBody"
        Examples:
            | status   |
            | passing  |
            | degraded |
            | failed   |

    @oipinvalidstatus
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
            | status    | slow        |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 400
            And I save response body as "responseBody"
        Examples:
            | timeScale |
            | 1h        |
            | 24h       |
            | 7d        |
            | 30d       |


    @oipinvalidtoken
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am '<token>' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
        When I send "GET" request to "oipmodule" on "oip_service" service
        Then The response status should be 401
            And I save response body as "responseBody"
        Examples:
            | token         | timeScale |
            | invalid_token | 1h        |
            | invalid_token | 24h       |
            | invalid_token | 7d        |
            | invalid_token | 30d       |
            | no_token      | 1h        |
            | no_token      | 24h       |
            | no_token      | 7d        |
            | no_token      | 30d       |


    # latency
    @latencyvalid
    Scenario: Valid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key        | value        |
            | projectKey | <projectKey> |
            | timeScale  | <timeScale>  |
        When I send "GET" request to "latency" on "oip_service" service
        Then The response status should be 200
            And I save response body as "responseBody"
        Examples:
            | projectKey  | timeScale |
            | yc          | 1h        |
            | yc          | 24h       |
            | yc          | 7d        |
            | yc          | 30d       |
            | yfc         | 24h       |
            | yfc         | 1h        |
            | yfc         | 7d        |
            | yfc         | 30d       |
            | adminportal | 7d        |
            | adminportal | 1h        |
            | adminportal | 24h       |
            | adminportal | 30d       |
            | All DVCS    | 1h        |
            | All DVCS    | 24h       |
            | All DVCS    | 7d        |
            | All DVCS    | 30d       |
            | heartbeat   | 1h        |
            | heartbeat   | 24h       |
            | heartbeat   | 7d        |
            | heartbeat   | 30d       |


    @latencyinvalidtimescale
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key        | value        |
            | projectKey | <projectKey> |
            | timeScale  | 32h          |
        When I send "GET" request to "latency" on "oip_service" service
        Then The response status should be 500
            And I save response body as "responseBody"
        Examples:
            | projectKey  |
            | yc          |
            | yfc         |
            | adminportal |
            | heartbeat   |
            | All DVCS    |

    @latencyinvalidtoken
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am '<token>' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
        When I send "GET" request to "latency" on "oip_service" service
        Then The response status should be 401
            And I save response body as "responseBody"
        Examples:
            | token         | timeScale |
            | invalid_token | 1h        |
            | invalid_token | 24h       |
            | invalid_token | 7d        |
            | invalid_token | 30d       |
            | no_token      | 1h        |
            | no_token      | 24h       |
            | no_token      | 7d        |
            | no_token      | 30d       |


    # overall availability
    @overallvalid
    Scenario: Valid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key        | value        |
            | projectKey | <projectKey> |
        When I send "GET" request to "overall" on "oip_service" service
        Then The response status should be 200
            And I save response body as "responseBody"
        Examples:
            | projectKey  |
            | yc          |
            | yfc         |
            | adminportal |
            | heartbeat   |
            | All DVCS    |

    @overallinvalid
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value     |
            | x-tenant-id | Indonesia |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key        | value        |
            | projectKey | <projectKey> |
        When I send "GET" request to "overall" on "oip_service" service
        Then The response status should be 200
            And I save response body as "responseBody"
        Examples:
            | projectKey  |
            | yc          |
            | yfc         |
            | adminportal |
            | heartbeat   |
            | All DVCS    |

    @overallinvalidtoken
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am '<token>' authenticated on 'oip_service' service is
            And I build dynamic query params with:
            | key        | value        |
            | projectKey | <projectKey> |
        When I send "GET" request to "overall" on "oip_service" service
        Then The response status should be 401
            And I save response body as "responseBody"
        Examples:
            | token         | projectKey  |
            | invalid_token | yc          |
            | invalid_token | yfc         |
            | invalid_token | adminportal |
            | invalid_token | heartbeat   |
            | invalid_token |             |
            | no_token      | yc          |
            | no_token      | yfc         |
            | no_token      | adminportal |
            | no_token      | heartbeat   |
            | no_token      |             |


    # submodule detail
    @submodulevalid
    Scenario: Valid request
        Given I build dynamic headers with:
            | key         | value      |
            | x-tenant-id | <tenantId> |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I set path params:
            | key       | value       |
            | module    | <module>    |
            | submodule | <submodule> |
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
        When I send "GET" request to "submodule" on "oip_service" service
        Then The response status should be 200
            And I save response body as "responseBody"
        Examples:
            | tenantId                             | module                               | submodule                            | timeScale |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | 32c89363-b532-468a-8828-d2a72038c7c1 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | 32c89363-b532-468a-8828-d2a72038c7c1 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | 32c89363-b532-468a-8828-d2a72038c7c1 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | 32c89363-b532-468a-8828-d2a72038c7c1 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 1h        |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 24h       |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 7d        |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 | 30d       |

    @submoduleinvalidtimescale
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value     |
            | x-tenant-id | Indonesia |
        Given I am 'valid_token' authenticated on 'oip_service' service is
            And I set path params:
            | key       | value       |
            | module    | <module>    |
            | submodule | <submodule> |
            And I build dynamic query params with:
            | key       | value       |
            | timeScale | <timeScale> |
        When I send "GET" request to "submodule" on "oip_service" service
        Then The response status should be 403
            And I save response body as "responseBody"
        Examples:
            | tenantId                             | module                               | submodule                            |
            | 4d1c5d95-5895-48b4-b6f9-74dd3dfc20ed | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | 3080adbb-1127-4101-b0b3-47e0a747f0e2 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | ee92fab8-985f-4b0b-931d-d1d19151be45 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | 32c89363-b532-468a-8828-d2a72038c7c1 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | 884fab4d-cd56-40ed-ac47-830eac9bf9f9 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | 74336175-95c1-4daf-811d-c7ce180f6235 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | d6d6a632-b66f-4894-a27e-3aef6d5c387b | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | 1acc963f-a736-4235-9baa-e3c581514f19 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |
            | 281f8a07-4b13-465e-8b04-426ee8fd3430 | 850cea93-bbcc-488f-9663-7ac7c0096a89 | c741ec2a-93af-4452-900e-0e5efaf29ad0 |

    @overallinvalidtoken
    Scenario: Invalid request
        Given I build dynamic headers with:
            | key         | value        |
            | x-tenant-id | {{tenantId}} |
        Given I am '<token>' authenticated on 'oip_service' service is
        When I send "GET" request to "overall" on "oip_service" service
        Then The response status should be 401
            And I save response body as "responseBody"
        Examples:
            | token         |
            | invalid_token |
            | no_token      |


