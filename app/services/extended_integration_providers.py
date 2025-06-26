"""
Extended integration providers for comprehensive third-party ecosystem support
"""

# Comprehensive integration providers covering CRMs, communication tools, 
# time trackers, learning platforms, and project management tools
EXTENDED_INTEGRATION_PROVIDERS = [
    # Communication Tools
    {
        "name": "slack",
        "display_name": "Slack",
        "description": "Team communication and collaboration platform",
        "category": "communication",
        "base_url": "https://slack.com/api",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://slack.com/oauth/v2/authorize",
            "token_url": "https://slack.com/api/oauth.v2.access",
            "scopes": ["channels:read", "chat:write", "users:read"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 100},
        "logo_url": "https://a.slack-edge.com/80588/img/icons/app-256.png"
    },
    {
        "name": "microsoft_teams",
        "display_name": "Microsoft Teams",
        "description": "Team collaboration and communication platform",
        "category": "communication",
        "base_url": "https://graph.microsoft.com/v1.0",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            "scopes": ["https://graph.microsoft.com/Team.ReadBasic.All", "https://graph.microsoft.com/Chat.Read"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg"
    },
    {
        "name": "discord",
        "display_name": "Discord",
        "description": "Voice, video, and text communication for teams",
        "category": "communication",
        "base_url": "https://discord.com/api/v10",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://discord.com/api/oauth2/authorize",
            "token_url": "https://discord.com/api/oauth2/token",
            "scopes": ["bot", "messages.read"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 50},
        "logo_url": "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
    },
    {
        "name": "zoom",
        "display_name": "Zoom",
        "description": "Video conferencing and webinar platform",
        "category": "communication",
        "base_url": "https://api.zoom.us/v2",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://zoom.us/oauth/authorize",
            "token_url": "https://zoom.us/oauth/token",
            "scopes": ["meeting:read", "webinar:read"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://st1.zoom.us/zoom.ico"
    },
    {
        "name": "webex",
        "display_name": "Cisco Webex",
        "description": "Enterprise video conferencing and collaboration",
        "category": "communication",
        "base_url": "https://webexapis.com/v1",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://webexapis.com/v1/authorize",
            "token_url": "https://webexapis.com/v1/access_token",
            "scopes": ["spark:all"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 300},
        "logo_url": "https://www.webex.com/content/dam/wbx/global/images/webex-logo.svg"
    },
    {
        "name": "mattermost",
        "display_name": "Mattermost",
        "description": "Open-source team collaboration platform",
        "category": "communication",
        "base_url": "https://your-mattermost-url.com/api/v4",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://your-mattermost-url.com/oauth/authorize",
            "token_url": "https://your-mattermost-url.com/oauth/access_token",
            "scopes": ["read_channel", "post:channel"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://mattermost.com/wp-content/uploads/2022/02/icon_WS.png"
    },

    # CRM Systems
    {
        "name": "salesforce",
        "display_name": "Salesforce",
        "description": "Leading cloud-based CRM platform",
        "category": "crm",
        "base_url": "https://login.salesforce.com",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://login.salesforce.com/services/oauth2/authorize",
            "token_url": "https://login.salesforce.com/services/oauth2/token",
            "scopes": ["api", "refresh_token"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_day": 100000},
        "logo_url": "https://c1.sfdcstatic.com/content/dam/web/en_us/www/images/nav/salesforce-logo.svg"
    },
    {
        "name": "hubspot",
        "display_name": "HubSpot",
        "description": "Inbound marketing and sales CRM platform",
        "category": "crm",
        "base_url": "https://api.hubapi.com",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://app.hubspot.com/oauth/authorize",
            "token_url": "https://api.hubapi.com/oauth/v1/token",
            "scopes": ["contacts", "content"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png"
    },
    {
        "name": "pipedrive",
        "display_name": "Pipedrive",
        "description": "Sales-focused CRM and pipeline management",
        "category": "crm",
        "base_url": "https://api.pipedrive.com/v1",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://oauth.pipedrive.com/oauth/authorize",
            "token_url": "https://oauth.pipedrive.com/oauth/token",
            "scopes": ["base"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://cdn.pipedrive.com/raven/img/pipedrivelogo.svg"
    },
    {
        "name": "zoho_crm",
        "display_name": "Zoho CRM",
        "description": "Comprehensive customer relationship management",
        "category": "crm",
        "base_url": "https://www.zohoapis.com/crm/v2",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://accounts.zoho.com/oauth/v2/auth",
            "token_url": "https://accounts.zoho.com/oauth/v2/token",
            "scopes": ["ZohoCRM.modules.ALL"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 200},
        "logo_url": "https://www.zoho.com/sites/zweb/images/zoho-logo.svg"
    },
    {
        "name": "freshworks_crm",
        "display_name": "Freshworks CRM",
        "description": "AI-powered customer relationship management",
        "category": "crm",
        "base_url": "https://domain.freshsales.io/api",
        "auth_type": "api_key",
        "auth_config": {
            "api_key_header": "Authorization",
            "api_key_prefix": "Token token="
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 1000},
        "logo_url": "https://www.freshworks.com/static-assets/images/common/company/logos/logo-fworks-black.svg"
    },
    {
        "name": "airtable",
        "display_name": "Airtable",
        "description": "Cloud collaboration service with database capabilities",
        "category": "crm",
        "base_url": "https://api.airtable.com/v0",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://airtable.com/oauth2/v1/authorize",
            "token_url": "https://airtable.com/oauth2/v1/token",
            "scopes": ["data.records:read", "data.records:write"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 5},
        "logo_url": "https://static.airtable.com/images/favicon/favicon-32x32.png"
    },
    {
        "name": "copper",
        "display_name": "Copper",
        "description": "CRM built for Google Workspace",
        "category": "crm",
        "base_url": "https://api.copper.com/developer_api/v1",
        "auth_type": "api_key",
        "auth_config": {
            "api_key_header": "X-PW-AccessToken",
            "email_header": "X-PW-UserEmail"
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 600},
        "logo_url": "https://copper.com/wp-content/uploads/2021/10/copper-logo.svg"
    },

    # Project Management Tools
    {
        "name": "trello",
        "display_name": "Trello",
        "description": "Visual project management with boards and cards",
        "category": "project_management",
        "base_url": "https://api.trello.com/1",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://trello.com/1/authorize",
            "token_url": "https://trello.com/1/OAuthGetAccessToken",
            "scopes": ["read", "write"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://d2k1ftgv7pobq7.cloudfront.net/meta/c/p/res/images/trello-header-logos/167dc7b9900a5b241b15ba21f8037cf8/trello-logo-blue.svg"
    },
    {
        "name": "asana",
        "display_name": "Asana",
        "description": "Team project and task management platform",
        "category": "project_management",
        "base_url": "https://app.asana.com/api/1.0",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://app.asana.com/-/oauth_authorize",
            "token_url": "https://app.asana.com/-/oauth_token",
            "scopes": ["default"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 1500},
        "logo_url": "https://luna1.co/eb0187.png"
    },
    {
        "name": "monday",
        "display_name": "Monday.com",
        "description": "Work operating system for project management",
        "category": "project_management",
        "base_url": "https://api.monday.com/v2",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://auth.monday.com/oauth2/authorize",
            "token_url": "https://auth.monday.com/oauth2/token",
            "scopes": ["boards:read", "boards:write"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 60},
        "logo_url": "https://dapulse-res.cloudinary.com/image/upload/f_auto,q_auto/remote_mondaycom_static/img/monday-logo-x2.png"
    },
    {
        "name": "jira",
        "display_name": "Atlassian Jira",
        "description": "Issue tracking and agile project management",
        "category": "project_management",
        "base_url": "https://your-domain.atlassian.net/rest/api/3",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://auth.atlassian.com/authorize",
            "token_url": "https://auth.atlassian.com/oauth/token",
            "scopes": ["read:jira-work", "write:jira-work"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://wac-cdn.atlassian.com/dam/jcr:8f27f4d6-2359-4f8d-b8c3-2c0a367e3c8a/jira%20software-icon-blue.svg"
    },
    {
        "name": "notion",
        "display_name": "Notion",
        "description": "All-in-one workspace for notes, docs, and projects",
        "category": "project_management",
        "base_url": "https://api.notion.com/v1",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://api.notion.com/v1/oauth/authorize",
            "token_url": "https://api.notion.com/v1/oauth/token",
            "scopes": ["read", "write"]
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_second": 3},
        "logo_url": "https://www.notion.so/images/logo-ios.png"
    },
    {
        "name": "clickup",
        "display_name": "ClickUp",
        "description": "All-in-one productivity and project management",
        "category": "project_management",
        "base_url": "https://api.clickup.com/api/v2",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://app.clickup.com/api",
            "token_url": "https://app.clickup.com/api/v2/oauth/token",
            "scopes": ["task:read", "task:write"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 100},
        "logo_url": "https://d2gdx5nv84sdx2.cloudfront.net/uploads/n5r3z4g2/marketing_asset/banner/4389/ClickUp_Symbol.png"
    },
    {
        "name": "basecamp",
        "display_name": "Basecamp",
        "description": "Project management and team collaboration",
        "category": "project_management",
        "base_url": "https://3.basecampapi.com",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://launchpad.37signals.com/authorization/new",
            "token_url": "https://launchpad.37signals.com/authorization/token",
            "scopes": []
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_second": 1},
        "logo_url": "https://basecamp.com/assets/logo-bc3-1f4e9e5b.svg"
    },
    {
        "name": "wrike",
        "display_name": "Wrike",
        "description": "Professional project management and collaboration",
        "category": "project_management",
        "base_url": "https://www.wrike.com/api/v4",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://login.wrike.com/oauth2/authorize/v4",
            "token_url": "https://login.wrike.com/oauth2/token",
            "scopes": ["Default", "wsReadWrite"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_second": 100},
        "logo_url": "https://www.wrike.com/v3/static/common/images/wrike-logo.svg"
    },

    # Time Tracking Tools
    {
        "name": "toggl",
        "display_name": "Toggl Track",
        "description": "Simple and intuitive time tracking",
        "category": "time_tracking",
        "base_url": "https://api.track.toggl.com/api/v9",
        "auth_type": "basic_auth",
        "auth_config": {
            "username_field": "api_token",
            "password_field": "api_token"
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_second": 1},
        "logo_url": "https://public-assets.toggl.com/b/static/f24b2eb8b7e7a8b8b1e4b8b8b8b8b8b8/toggl-logo.svg"
    },
    {
        "name": "harvest",
        "display_name": "Harvest",
        "description": "Time tracking and invoicing for teams",
        "category": "time_tracking",
        "base_url": "https://api.harvestapp.com/v2",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://id.getharvest.com/oauth2/authorize",
            "token_url": "https://id.getharvest.com/api/v2/oauth2/token",
            "scopes": ["harvest:read", "harvest:write"]
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_second": 100},
        "logo_url": "https://www.getharvest.com/hubfs/harvest-logo-icon.svg"
    },
    {
        "name": "clockify",
        "display_name": "Clockify",
        "description": "Free time tracking software for teams",
        "category": "time_tracking",
        "base_url": "https://api.clockify.me/api/v1",
        "auth_type": "api_key",
        "auth_config": {
            "api_key_header": "X-Api-Key"
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://clockify.me/assets/images/clockify-logo.svg"
    },
    {
        "name": "rescuetime",
        "display_name": "RescueTime",
        "description": "Automatic time tracking and productivity insights",
        "category": "time_tracking",
        "base_url": "https://www.rescuetime.com/anapi",
        "auth_type": "api_key",
        "auth_config": {
            "api_key_param": "key"
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_hour": 1000},
        "logo_url": "https://www.rescuetime.com/images/rescuetime_logo_mark.png"
    },
    {
        "name": "timely",
        "display_name": "Timely",
        "description": "AI-powered automatic time tracking",
        "category": "time_tracking",
        "base_url": "https://api.timelyapp.com/1.1",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://api.timelyapp.com/1.1/oauth/authorize",
            "token_url": "https://api.timelyapp.com/1.1/oauth/token",
            "scopes": ["read", "write"]
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_minute": 60},
        "logo_url": "https://timelyapp.com/images/timely-logo.svg"
    },
    {
        "name": "time_doctor",
        "display_name": "Time Doctor",
        "description": "Employee time tracking and productivity monitoring",
        "category": "time_tracking",
        "base_url": "https://api2.timedoctor.com/api/1.0",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://api2.timedoctor.com/api/1.0/authorization",
            "token_url": "https://api2.timedoctor.com/api/1.0/access_token",
            "scopes": ["read", "write"]
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_minute": 120},
        "logo_url": "https://www.timedoctor.com/images/time-doctor-logo.svg"
    },
    {
        "name": "hubstaff",
        "display_name": "Hubstaff",
        "description": "Time tracking with screenshots and activity levels",
        "category": "time_tracking",
        "base_url": "https://api.hubstaff.com/v2",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://account.hubstaff.com/authorizations/new",
            "token_url": "https://account.hubstaff.com/access_tokens",
            "scopes": ["hubstaff:read", "hubstaff:write"]
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_minute": 200},
        "logo_url": "https://hubstaff.com/assets/hubstaff_logo.svg"
    },

    # Learning Platforms
    {
        "name": "coursera",
        "display_name": "Coursera",
        "description": "Online courses and professional certificates",
        "category": "learning",
        "base_url": "https://api.coursera.org/api",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://accounts.coursera.org/oauth2/v1/auth",
            "token_url": "https://accounts.coursera.org/oauth2/v1/token",
            "scopes": ["view_profile"]
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_hour": 1000},
        "logo_url": "https://d3c33hcgiwev3.cloudfront.net/imageAssetProxy.v1/coursera-logo-square.png"
    },
    {
        "name": "udemy",
        "display_name": "Udemy",
        "description": "Online learning marketplace with courses",
        "category": "learning",
        "base_url": "https://www.udemy.com/api-2.0",
        "auth_type": "basic_auth",
        "auth_config": {
            "username_field": "client_id",
            "password_field": "client_secret"
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_minute": 200},
        "logo_url": "https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg"
    },
    {
        "name": "linkedin_learning",
        "display_name": "LinkedIn Learning",
        "description": "Professional development and skill building",
        "category": "learning",
        "base_url": "https://api.linkedin.com/v2",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://www.linkedin.com/oauth/v2/authorization",
            "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
            "scopes": ["r_liteprofile", "r_emailaddress"]
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_day": 500000},
        "logo_url": "https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Logo.svg.original.svg"
    },
    {
        "name": "pluralsight",
        "display_name": "Pluralsight",
        "description": "Technology skills development platform",
        "category": "learning",
        "base_url": "https://app.pluralsight.com/learner/user/api",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://app.pluralsight.com/id/oauth/authorize",
            "token_url": "https://app.pluralsight.com/id/oauth/token",
            "scopes": ["offline_access"]
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_minute": 60},
        "logo_url": "https://www.pluralsight.com/content/dam/pluralsight2/logos/pluralsight-logo-vrt-color-2.png"
    },
    {
        "name": "skillshare",
        "display_name": "Skillshare",
        "description": "Creative and business skill learning platform",
        "category": "learning",
        "base_url": "https://api.skillshare.com/v1",
        "auth_type": "api_key",
        "auth_config": {
            "api_key_header": "Authorization",
            "api_key_prefix": "Bearer "
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_hour": 1000},
        "logo_url": "https://static.skillshare.com/assets/images/header-logo-new.svg"
    },
    {
        "name": "udacity",
        "display_name": "Udacity",
        "description": "Tech skills and nanodegree programs",
        "category": "learning",
        "base_url": "https://api.udacity.com/api/v1",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://auth.udacity.com/oauth2/authorize",
            "token_url": "https://auth.udacity.com/oauth2/token",
            "scopes": ["read"]
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_hour": 1000},
        "logo_url": "https://www.udacity.com/images/svgs/udacity-tt-logo.svg"
    },
    {
        "name": "edx",
        "display_name": "edX",
        "description": "University-level online courses and programs",
        "category": "learning",
        "base_url": "https://api.edx.org/api",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://api.edx.org/oauth2/authorize",
            "token_url": "https://api.edx.org/oauth2/access_token",
            "scopes": ["read"]
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_hour": 1000},
        "logo_url": "https://www.edx.org/images/logos/edx-logo-elm.svg"
    },
    {
        "name": "khan_academy",
        "display_name": "Khan Academy",
        "description": "Free online courses and educational content",
        "category": "learning",
        "base_url": "https://www.khanacademy.org/api/v1",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://www.khanacademy.org/api/auth2/authorize",
            "token_url": "https://www.khanacademy.org/api/auth2/token",
            "scopes": []
        },
        "supported_operations": ["read"],
        "rate_limits": {"requests_per_hour": 1000},
        "logo_url": "https://cdn.kastatic.org/images/khan-logo-dark-background.png"
    },

    # Development & Productivity Tools
    {
        "name": "github",
        "display_name": "GitHub",
        "description": "Code repository and development collaboration",
        "category": "development",
        "base_url": "https://api.github.com",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://github.com/login/oauth/authorize",
            "token_url": "https://github.com/login/oauth/access_token",
            "scopes": ["repo", "user"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_hour": 5000},
        "logo_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
    },
    {
        "name": "gitlab",
        "display_name": "GitLab",
        "description": "DevOps platform for code collaboration",
        "category": "development",
        "base_url": "https://gitlab.com/api/v4",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://gitlab.com/oauth/authorize",
            "token_url": "https://gitlab.com/oauth/token",
            "scopes": ["api", "read_user"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_minute": 2000},
        "logo_url": "https://about.gitlab.com/images/press/logo/svg/gitlab-logo-500.svg"
    },
    {
        "name": "bitbucket",
        "display_name": "Bitbucket",
        "description": "Git repository management and CI/CD",
        "category": "development",
        "base_url": "https://api.bitbucket.org/2.0",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://bitbucket.org/site/oauth2/authorize",
            "token_url": "https://bitbucket.org/site/oauth2/access_token",
            "scopes": ["repositories", "account"]
        },
        "supported_operations": ["read", "write", "webhook"],
        "rate_limits": {"requests_per_hour": 1000},
        "logo_url": "https://wac-cdn.atlassian.com/dam/jcr:e2a6f06f-b3d5-4002-aed3-73539c56a2eb/bitbucket%20logo%20blue.svg"
    },
    {
        "name": "google_workspace",
        "display_name": "Google Workspace",
        "description": "Gmail, Drive, Calendar, and Contacts integration",
        "category": "productivity",
        "base_url": "https://www.googleapis.com",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://accounts.google.com/o/oauth2/auth",
            "token_url": "https://oauth2.googleapis.com/token",
            "scopes": ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/drive.readonly"]
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_day": 1000000},
        "logo_url": "https://developers.google.com/workspace/images/workspace-logo.svg"
    },
    {
        "name": "microsoft_365",
        "display_name": "Microsoft 365",
        "description": "Office apps, Outlook, OneDrive integration",
        "category": "productivity",
        "base_url": "https://graph.microsoft.com/v1.0",
        "auth_type": "oauth2",
        "auth_config": {
            "authorization_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            "token_url": "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            "scopes": ["https://graph.microsoft.com/Mail.Read", "https://graph.microsoft.com/Files.Read"]
        },
        "supported_operations": ["read", "write"],
        "rate_limits": {"requests_per_second": 10},
        "logo_url": "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE1Mu3b"
    }
]