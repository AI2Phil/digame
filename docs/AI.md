# Digame AI Systems Documentation

This document outlines the AI features within the Digame platform, the backend infrastructure supporting key AI-driven interactions like onboarding, and the necessary database migrations for AI-related features such as API key management.

## AI Features and User Journey Impact

This section outlines the key Artificial Intelligence (AI) features within the Digame platform and how they enhance each phase of the user journey. Our AI capabilities are designed to provide personalized guidance, automate insights, and accelerate professional growth.

### Core AI Systems (Foundation)

These systems are already implemented and form the backbone of many user-facing AI features:

*   **Behavioral Analysis System:**
    *   **User Journey Impact (Phases 2-5):** From the moment a user starts building their profile (Phase 2: Profile Creation & Assessment), this system analyzes work patterns, communication styles (future), and activity data. In Phase 3 (Active Monitoring & Learning), it provides real-time insights into productivity and work habits. For Growth & Development (Phase 4), it identifies behavioral patterns that might be helping or hindering progress, feeding into coaching and recommendations. During Mastery & Leadership (Phase 5), it can help leaders understand team dynamics.
*   **Predictive Modeling Framework:**
    *   **User Journey Impact (Phases 2-5):** This framework underpins features like skill development forecasting and career path modeling. It helps users understand their current trajectory (Phase 2), see potential growth paths (Phase 4), and make informed decisions about their development. For leaders (Phase 5), it can assist in succession planning and talent development strategies.

### AI-Driven Features (Future Development)

#### Enhancing Phase 1: Discovery & Onboarding

*   **Interactive Onboarding System (Smart Recommendations):**
    *   **User Journey Impact:** Makes the initial interaction with Digame (Phase 1) more relevant and engaging. By providing smart, role-based feature recommendations and personalized setup guidance, users quickly see the platform's value, leading to better adoption and a smoother transition to Profile Creation & Assessment (Phase 2).
*   **AI-Powered Notification Timing (Advanced Mobile Features):**
    *   **User Journey Impact:** Ensures that notifications (learning reminders, insights) are delivered when they are most likely to be relevant and actionable for the user, improving engagement throughout all phases of the journey, particularly Active Monitoring & Learning (Phase 3).
*   **Voice Recognition Support (Advanced Mobile Features):**
    *   **User Journey Impact:** Simplifies data input and interaction with the platform (e.g., logging activities, documenting processes) across all journey phases, making it easier for users to keep their digital twin up-to-date and receive accurate insights.

#### Enhancing Phase 2: Profile Creation & Assessment

*   **Skill Gap Analysis Engine (Personalized Learning Recommendation Engine):**
    *   **User Journey Impact:** Directly impacts Profile Creation & Assessment (Phase 2) by providing users with a clear understanding of their strengths and weaknesses against their career goals or industry benchmarks. This sets a clear direction for Active Monitoring & Learning (Phase 3).
*   **Behavioral Pattern Insights (Intelligent Coaching & Insights):**
    *   **User Journey Impact:** During Profile Creation & Assessment (Phase 2) and Active Monitoring & Learning (Phase 3), users gain deep insights into their work styles, focus periods, and collaboration patterns, helping them understand their baseline and areas for optimization.

#### Enhancing Phase 3: Active Monitoring & Learning

*   **Personalized Learning Recommendation Engine (Full Suite):**
    *   **User Journey Impact:** This is central to Active Monitoring & Learning (Phase 3). Adaptive algorithms, personalized paths, and curated content ensure users are constantly engaged with relevant material to close skill gaps identified in Phase 2, accelerating their Growth & Development (Phase 4). Learning progress prediction keeps users motivated.
*   **Smart Learning Reminders & Performance Insights Alerts (Real-time Notifications & Alerts):**
    *   **User Journey Impact:** Keeps users engaged and on track during Active Monitoring & Learning (Phase 3). Alerts about performance improvements or areas needing attention provide timely feedback, reinforcing positive behaviors or suggesting course corrections.
*   **Intelligent Coaching & Insights (Productivity, Skill Development):**
    *   **User Journey Impact:** Acts as a personalized digital coach throughout Active Monitoring & Learning (Phase 3) and Growth & Development (Phase 4). Provides actionable suggestions for optimizing productivity and tailored guidance for skill development, making the learning process more effective.

#### Enhancing Phase 4: Growth & Development

*   **Advanced Career Path Modeling:**
    *   **User Journey Impact:** Empowers users in the Growth & Development phase (Phase 4) by visualizing potential career trajectories, predicting progression, and analyzing market demand. This helps users make strategic decisions about their career and identify the skills needed to reach their goals, potentially leading to Mastery & Leadership (Phase 5).
*   **Predictive Performance Modeling (Advanced Performance Analytics):**
    *   **User Journey Impact:** Allows users to forecast their performance improvements and understand the potential impact of acquiring new skills or changing behaviors, motivating them during the Growth & Development phase (Phase 4).
*   **Peer Matching & Networking / Mentor-Mentee Matching:**
    *   **User Journey Impact:** Enriches the Growth & Development phase (Phase 4) by connecting users with peers for collaborative learning and mentors for guidance. AI-assisted matching ensures these connections are relevant and impactful.
*   **Skill Demand Forecasting (Market Intelligence & Industry Insights):**
    *   **User Journey Impact:** Helps users align their skill development efforts in Phase 4 with current and future market needs, ensuring their growth is relevant and valuable.

#### Enhancing Phase 5: Mastery & Leadership

*   **Team Performance Analytics & Collaboration Pattern Analysis (Team Collaboration & Insights):**
    *   **User Journey Impact:** For users entering Mastery & Leadership (Phase 5), these AI-driven insights help them understand team dynamics, optimize collaboration, and identify skill gaps within their teams, fostering better leadership.

### AI-Powered Writing Assistance

*   **User Journey Impact:** Enhances content creation across all platform interactions by providing real-time suggestions for clarity, grammar, and style, improving the quality and effectiveness of user-generated text. This is particularly beneficial during Phase 2 (Profile Creation), Phase 3 (Active Monitoring & Learning, e.g., writing process notes), and Phase 5 (Mastery & Leadership, e.g., drafting communications).
*   **Implementation Details (Multi-Tenant Context):**
    *   **Tenant Enablement:** This feature can be activated by tenant administrators if their subscription tier (typically 'Professional' or 'Enterprise') includes it. The availability is managed by the `writing_assistance` flag within the tenant's specific feature settings.
    *   **User API Key Requirement:** For the feature to function, each user within an enabled tenant needs to supply their personal API key for the designated external writing assistance service. This key must be saved in their User Settings page, specifically under the key name `writing_service_key`.
    *   **Functionality:** When the feature is active for the tenant and a user has provided their `writing_service_key`, the platform offers writing suggestions through the `/ai/writing-assistance/suggest` API endpoint.
*   **Current Status:** The initial backend infrastructure for this feature is now implemented. This includes the ability for users to store the necessary `writing_service_key`, mechanisms for tenant administrators to enable the feature based on subscription tiers, and a functional API endpoint that currently connects to a mock external service for generating suggestions. Further frontend integration is required for user interaction.

### Communication Style Analysis

*   **User Journey Impact:** Provides users with insights into their written communication style, helping them understand how their tone and choice of words might be perceived. This fosters self-awareness and enables users to adapt their communication for different audiences and goals, leading to more effective interactions. This is valuable in Phase 2 (Profile Creation, e.g., crafting professional summaries), Phase 3 (Active Monitoring & Learning, e.g., writing effective emails or process notes), and Phase 5 (Mastery & Leadership, e.g., team communication and external correspondence).
*   **Implementation Details (Multi-Tenant Context):**
    *   **Tenant Enablement:** This feature's availability is determined by the tenant's subscription tier (typically 'Professional' or 'Enterprise') and can be activated by tenant administrators. It is controlled by the `communication_style_analysis` flag in the tenant's specific feature settings.
    *   **User API Key Requirement:** For the feature to function, each user within an enabled tenant needs to supply their personal API key for the designated external NLP service that performs communication style analysis. This key must be saved in their User Settings page under the key name `communication_style_service_key`.
    *   **Functionality:** When the feature is active for the tenant and a user has provided their `communication_style_service_key`, the platform offers an analysis of communication style for submitted text. This is accessible via the `/ai/communication-style/analyze` API endpoint. The analysis can include identified style categories (e.g., formal, informal, assertive), confidence scores, and other relevant metrics.
*   **Current Status:** The initial backend infrastructure for this feature is now implemented. This includes the system for users to store the `communication_style_service_key`, the mechanism for tenant-level feature enablement based on subscription tiers, and a functional API endpoint that currently interfaces with a mock external NLP service for generating the style analysis. Frontend development is needed to allow users to submit text and view their analysis results.

### Meeting Insights & Summaries

*   **User Journey Impact:** Helps users save time and improve meeting effectiveness by automatically generating summaries, identifying key discussion points, and extracting potential action items from meeting text (such as notes or transcripts). This allows for quicker post-meeting follow-ups and better knowledge retention, especially valuable during Phase 3 (Active Monitoring & Learning) and Phase 5 (Mastery & Leadership).
*   **Implementation Details (Multi-Tenant Context):**
    *   **Tenant Enablement:** The availability of this feature is determined by the tenant's subscription tier (typically 'Professional' or 'Enterprise') and can be activated by tenant administrators. It is controlled by the `meeting_insights` flag in the tenant's specific feature settings.
    *   **User API Key Requirement:** For the feature to function, each user within an enabled tenant needs to supply their personal API key for the designated external NLP or summarization service. This key must be saved in their User Settings page under the key name `meeting_insights_service_key`.
    *   **Functionality:** When the feature is active for the tenant and a user has provided their `meeting_insights_service_key`, the platform can process submitted meeting text. This is accessible via the `/ai/meeting-insights/analyze` API endpoint. The returned analysis typically includes a concise summary, a list of key discussion points, and identified action items.
*   **Current Status:** The initial backend infrastructure for this feature is now implemented. This includes the system for users to store the `meeting_insights_service_key`, the mechanism for tenant-level feature enablement based on subscription tiers, and a functional API endpoint that currently interfaces with a mock external NLP service for generating the insights. Frontend development is needed to allow users to submit meeting text and view the analysis.

### Email Pattern Analysis

*   **User Journey Impact:** Provides insights into personal or team email habits, helping to identify communication trends, potential bottlenecks, or areas for productivity improvement related to email management. It can help users understand their responsiveness, common topics, and peak communication periods.
*   **Implementation Details (Multi-Tenant Context):**
    *   **Tenant Enablement:** The availability of this feature is determined by the tenant's subscription tier (typically 'Professional' or 'Enterprise') and can be activated by tenant administrators. It is controlled by the `email_pattern_analysis` flag in the tenant's specific feature settings.
    *   **User API Key & Internal Analysis:** The feature supports two modes of operation. For advanced analysis capabilities, users can provide an API key for a designated external email analysis service. This key should be stored in their User Settings under the name `email_analysis_service_key`. If this key is not provided, the system can perform a basic internal analysis on the submitted email data, such as identifying frequent subject keywords.
    *   **Functionality:** Users can submit a list of their email data (potentially including subjects, sender/recipient information, and timestamps) via the `/ai/email-analysis/analyze` API endpoint. The service then returns a structured summary of identified patterns and insights.
    *   **Data Privacy Note:** It is crucial that users ensure any email data submitted for analysis complies with all applicable privacy policies. If using external analysis services, particular care should be taken with sensitive information, and data should be anonymized where appropriate.
*   **Current Status:** The initial backend infrastructure for this feature is now implemented. This includes the system for users to store an optional `email_analysis_service_key`, the mechanism for tenant-level feature enablement, and a functional API endpoint. The endpoint interfaces with a mock external service if a key is provided, or performs a basic internal analysis otherwise. Frontend development is needed for users to submit email data and visualize the resulting patterns.

### Language Learning Support

*   **User Journey Impact:** Assists users in improving their language skills or understanding text in different languages by offering tools like translation and vocabulary definitions. This can be valuable for users working in multilingual environments or looking to expand their linguistic capabilities.
*   **Implementation Details (Multi-Tenant Context):**
    *   **Tenant Enablement:** The availability of this feature is determined by the tenant's subscription tier (typically 'Professional' or 'Enterprise') and can be activated by tenant administrators. It is controlled by the `language_learning_support` flag in the tenant's specific feature settings.
    *   **User API Key Requirement:** To access the core functionalities such as translation and vocabulary definitions, which rely on external language processing services, each user within an enabled tenant needs to supply their personal API key. This key must be saved in their User Settings page under the key name `language_learning_api_key`.
    *   **Functionality:** When the feature is active for the tenant and a user has provided their `language_learning_api_key`, the platform offers the following language tools:
        *   **Text Translation:** Accessible via the `/ai/language/translate` API endpoint, allowing users to translate text snippets to a target language, optionally specifying the source language.
        *   **Vocabulary Definition:** Accessible via the `/ai/language/define` API endpoint, providing definitions and usage examples for words in various supported languages.
*   **Current Status:** The initial backend infrastructure for Language Learning Support is implemented. This includes the system for users to store the `language_learning_api_key`, the mechanism for tenant-level feature enablement, and functional API endpoints for translation and definition lookups. These endpoints currently interface with a mock external language service. Frontend development is needed to allow users to interact with these language tools.

## Workflow Automation & Task Management (Future Development - Initial Components)

This category focuses on AI features designed to streamline workflows, automate routine tasks, and assist users in managing their responsibilities more effectively.

### Intelligent Task Prioritization

*   **User Journey Impact:** Assists users in managing their workload more effectively by automatically suggesting priority scores for their tasks. This helps users focus on what's most critical and timely, improving productivity and reducing the cognitive load of manual prioritization. This is particularly useful in Phase 3 (Active Monitoring & Learning) and Phase 4 (Growth & Development) as users manage an increasing number of tasks and goals.
*   **Implementation Details (Multi-Tenant Context):**
    *   **Tenant Enablement:** The availability of this feature is determined by the tenant's subscription tier (typically 'Professional' or 'Enterprise') and can be activated by tenant administrators. It is controlled by the `intelligent_task_prioritization` flag in the tenant's specific feature settings.
    *   **API Key Requirement:** The current version of this feature utilizes internal heuristics to analyze and suggest task priorities. It **does not** require users to provide an API key for an external service. Future iterations may explore integration with external AI-driven prioritization engines, which could then involve user-provided API keys.
    *   **Functionality:** When the feature is active for the tenant, users can request a re-prioritization of their active (non-completed, non-archived) tasks. This is done via the `/ai/tasks/prioritization/prioritize` API endpoint. The service returns a list of these tasks, each with its original priority score and a newly suggested `priority_score`. The request can also specify if these suggested scores should be automatically saved back to the tasks in the database.
    *   **Heuristics Used:** The initial set of internal heuristics considers factors such as:
        *   **Due Date Proximity:** Tasks that are overdue or due very soon receive a higher priority.
        *   **Keywords:** The presence of terms like "urgent," "asap," or "important" in the task description can increase its priority.
        *   **Task Status:** For example, tasks already 'in_progress' might be prioritized slightly higher than newly 'suggested' tasks.
*   **Current Status:** The initial backend infrastructure for Intelligent Task Prioritization is implemented. This includes the internal heuristic logic, the mechanism for tenant-level feature enablement, and a functional API endpoint for users to trigger prioritization and optionally save the results. Frontend development is needed to allow users to easily invoke this feature and see the suggestions.

*   **Natural Language Processing & Communication (Broader Suite - Future):**
    *   **User Journey Impact:** (Original text retained) In the Mastery & Leadership phase (Phase 5), features like communication style analysis (now partially implemented), meeting insights (backend implemented), email pattern analysis (backend implemented), and language learning support (backend implemented) can significantly enhance a leader's effectiveness and impact. AI-Powered Writing Assistance, Communication Style Analysis, Meeting Insights & Summaries, Email Pattern Analysis, and Language Learning Support are initial components of this broader suite.
*   **Workflow Automation & Task Management (Intelligent Prioritization, Process Optimization - Broader Suite):**
    *   **User Journey Impact:** Helps users at all levels, but particularly those in Mastery & Leadership (Phase 5) managing complex projects or teams, to optimize workflows, automate routine tasks, and focus on strategic priorities. Intelligent Task Prioritization is an initial component of this broader suite.
*   **Advanced Simulation & Decision Support:**
    *   **User Journey Impact:** Provides powerful tools for leaders in Phase 5 to conduct scenario planning, predict decision impacts, and make more informed strategic choices, leveraging their fully developed digital twin.

## Backend Infrastructure: Interactive Onboarding System

The backend for the Interactive Onboarding System provides the necessary data structures, storage logic, and API endpoints to manage a user's onboarding progress and preferences. This system is designed to create a personalized and adaptive onboarding experience.

The core components of the backend implementation are:

1.  **Pydantic Schemas for Onboarding Data (`digame/app/schemas/onboarding_schemas.py`)**
    *   **Role:** This file defines the structure and validation rules for onboarding-related data.
    *   **Summary:** It includes schemas such as:
        *   `OnboardingStep`: Represents individual steps or milestones within the onboarding process.
        *   `OnboardingDataBase`: Defines the core data fields that constitute a user's onboarding profile, such as their current step, a list of completed steps, user-defined preferences (e.g., notification settings, dashboard configurations), professional goals, and areas of feature exploration they are interested in.
        *   `OnboardingDataCreate` and `OnboardingDataUpdate`: Schemas used for creating and updating a user's onboarding data via the API, allowing for partial updates.
        *   `OnboardingDataResponse`: Defines the data structure returned by the API when onboarding information is requested.
    *   **Contribution:** These schemas ensure that onboarding data is consistent, validated, and clearly structured, facilitating reliable communication between the frontend, backend, and database.

2.  **CRUD Operations for Onboarding Data (`digame/app/crud/onboarding_crud.py`)**
    *   **Role:** This file contains the functions responsible for all Create, Read, Update, and Delete (CRUD) operations related to user onboarding data stored in the database.
    *   **Summary:** Key functions include:
        *   `get_onboarding_data(db: Session, user_id: int)`: Retrieves the onboarding data for a specific user. It fetches the JSON string stored in the `User.onboarding_data` field, parses it into the `OnboardingDataBase` Pydantic model, and handles cases where data might be missing or improperly formatted by returning a default, well-structured response.
        *   `update_onboarding_data(db: Session, user_id: int, data_update: schemas.OnboardingDataUpdate)`: Updates a user's onboarding information. It intelligently merges new data from the `data_update` payload with any existing onboarding data. It also updates the `User.onboarding_completed` flag based on the input. The consolidated data is then validated against the `OnboardingDataBase` schema and serialized back into a JSON string for storage in the `User.onboarding_data` field.
    *   **Contribution:** These CRUD operations abstract the database interaction logic, providing a clean interface for the API layer to manage onboarding data. They handle the crucial tasks of JSON serialization/deserialization and data validation.

3.  **API Endpoints for Onboarding (`digame/app/routers/auth_router.py`)**
    *   **Role:** The existing authentication router (`auth_router.py`) has been enhanced to manage user-specific onboarding data through dedicated endpoints.
    *   **Summary:** The relevant endpoints are:
        *   **`GET /auth/me/onboarding`**:
            *   Allows the authenticated user to retrieve their current onboarding status and data.
            *   It utilizes the `onboarding_crud.get_onboarding_data` function to fetch the information and returns it structured according to the `onboarding_schemas.OnboardingDataResponse` schema.
        *   **`POST /auth/me/onboarding`**:
            *   Allows the authenticated user to save or update their onboarding data.
            *   The request body is expected to conform to the `onboarding_schemas.OnboardingDataUpdate` schema, allowing for flexible and partial updates.
            *   It uses the `onboarding_crud.update_onboarding_data` function to persist the changes and returns the updated onboarding state.
    *   **Contribution:** These API endpoints provide the secure and authenticated interface for the frontend to interact with the user's onboarding data, enabling a dynamic and responsive onboarding experience. By refactoring these existing endpoints, we maintain a consistent API structure for user profile related information.

## Database Migration: API Key Management (`user_settings` table)

To support the API Key Management feature, a new database table named `user_settings` is required. This table stores API keys and other user-specific settings.

The following Alembic migration script (`manual_001_add_user_setting_table.py`) defines the schema for this table.

**Important Note on Applying this Migration:**
During development, there were issues applying Alembic migrations automatically due to the application environment being unable to resolve the database hostname 'db' (as specified in `alembic.ini`). This script was created manually. **It needs to be applied in an environment where the database is accessible to Alembic.** This typically involves running the command `alembic upgrade head` from a context that has network visibility to the database service.

### Migration Script Content:

```python
"""add_user_setting_table_manual

Revision ID: manual_001
Revises: 20250523_behavioral_models
Create Date: 2025-05-23 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'manual_001'
down_revision: Union[str, None] = '20250523_behavioral_models' # From the last empty autogen script
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('api_keys', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_user_settings')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_settings_user_id_users')),
        sa.UniqueConstraint('user_id', name=op.f('uq_user_settings_user_id'))
    )
    # Explicitly create index for user_id, even if unique constraint might create one, for FK performance.
    # The unique=False here is standard practice for non-unique indexes; the unique constraint handles uniqueness.
    op.create_index(op.f('ix_user_settings_user_id'), 'user_settings', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_settings_user_id'), table_name='user_settings')
    op.drop_table('user_settings')

```

This script creates the `user_settings` table with the following columns:
*   `id`: Primary key.
*   `user_id`: Foreign key to the `users` table, ensuring a one-to-one relationship (enforced by a unique constraint).
*   `api_keys`: A text field to store API keys, typically as a JSON string.
*   `created_at`: Timestamp for when the record was created.
*   `updated_at`: Timestamp for when the record was last updated.

Indexes are created for the primary key and the `user_id` foreign key to ensure efficient querying.


**BACKEND CODE FILES**

1. /digame/migrations/versions/manual_001_add_user_setting_table.py

"""add_user_setting_table_manual

Revision ID: manual_001
Revises: 20250523_behavioral_models
Create Date: 2025-05-23 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'manual_001'
down_revision: Union[str, None] = '20250523_behavioral_models' # From the last empty autogen script
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('api_keys', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_user_settings')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_user_settings_user_id_users')),
        sa.UniqueConstraint('user_id', name=op.f('uq_user_settings_user_id'))
    )
    # Explicitly create index for user_id, even if unique constraint might create one, for FK performance.
    # The unique=False here is standard practice for non-unique indexes; the unique constraint handles uniqueness.
    op.create_index(op.f('ix_user_settings_user_id'), 'user_settings', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_user_settings_user_id'), table_name='user_settings')
    op.drop_table('user_settings')


2. /digame/migrations/versions/0f44d5a99398_add_user_setting_table_v3.py

"""add_user_setting_table_v3

Revision ID: 0f44d5a99398
Revises: 20250523_behavioral_models
Create Date: 2025-05-23 22:42:46.736631

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0f44d5a99398'
down_revision: Union[str, None] = '20250523_behavioral_models'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

3. env.py [missed existing code and replacement code missed]

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import os
import sys

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add the app directory to Python path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# add your model's MetaData object here
# for 'autogenerate' support

# Import Base from the models package's __init__.py
from app.models import Base
# Import the models package itself to ensure all model modules within it are executed
# and their models are registered with the Base.
import app.models

# target_metadata should now contain all tables, including UserSetting
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True, # As per instructions for offline generation
        dialect_opts={"paramstyle": "named"},
        # compare_type=True, # Optional
        # render_as_batch=True # If using SQLite
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    This is the standard online configuration.
    """
    global target_metadata # Ensure target_metadata is available

    # This path is taken by 'alembic revision --autogenerate'.
    # Configure context for 'offline' comparison (metadata vs. migration history).
    # No actual connection is made; URL is for dialect info.
    # The actual context.run_migrations() that generates the script text
    # is called by Alembic's revision command machinery after this env.py runs.
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        dialect_opts={"paramstyle": "named"},
        compare_type=True, # For autogenerate
        compare_server_default=True, # For autogenerate
        # Do not include literal_binds=True here.
        # Do not include include_object or process_revision_directives here unless needed.
    )
    # For 'revision --autogenerate', we only need to configure the context.
    # No 'context.run_migrations()' or 'context.begin_transaction()' here,
    # as that would be for applying migrations or for --sql mode output.

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

4. /digame/migrations/__pycache__/env.cpython-310.pyc
empty

5. /digame/app/tests/routers/test_user_setting_router.py

import json
import pytest
import random
import string
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from fastapi import status

# Assuming conftest.py provides these fixtures
from digame.app.tests.conftest import db_session_test, client

from digame.app.models.user import User as UserModel
from digame.app.models.user_setting import UserSetting as UserSettingModel
from digame.app.schemas.user_setting_schemas import UserSetting as UserSettingSchema # For response validation
from digame.app.crud import user_setting_crud # To setup data if needed
from digame.app.auth.auth_dependencies import get_current_active_user


# Helper to create a unique user for API tests & for dependency override
# This user needs to exist in the DB for the test session
def create_and_get_test_user_for_api(db: Session, username_prefix: str) -> UserModel:
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"{username_prefix}_api_{random_suffix}@example.com"
    
    # Check if user exists, if not add them
    existing_user = db.query(UserModel).filter(UserModel.email == email).first()
    if not existing_user:
        mock_user_for_api = UserModel(
            username=f"{username_prefix}_api_{random_suffix}",
            email=email,
            hashed_password="fake_api_password", # Not used for auth in these tests due to override
            is_active=True
        )
        db.add(mock_user_for_api)
        db.commit()
        db.refresh(mock_user_for_api)
        return mock_user_for_api
    return existing_user


@pytest.fixture(scope="function")
def override_auth_for_settings_api(client: TestClient, db_session_test: Session):
    """Fixture to create a test user and override auth for settings API tests."""
    test_user = create_and_get_test_user_for_api(db_session_test, "settings_user")

    def override_get_current_active_user_for_settings():
        # Return a fresh instance from DB to ensure it has latest data if settings are created/updated
        return db_session_test.query(UserModel).filter(UserModel.id == test_user.id).first()

    client.app.dependency_overrides[get_current_active_user] = override_get_current_active_user_for_settings
    yield test_user # Provide the user to the test if needed
    client.app.dependency_overrides.clear()


def test_get_api_keys_no_settings_exist(client: TestClient, override_auth_for_settings_api):
    """
    Test GET /settings/api-keys when no settings exist for the user.
    The endpoint should create default settings (empty api_keys dict).
    """
    response = client.get("/settings/api-keys")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["api_keys"] == {}
    assert data["user_id"] == override_auth_for_settings_api.id # User provided by fixture


def test_get_api_keys_existing_settings(client: TestClient, db_session_test: Session, override_auth_for_settings_api):
    """
    Test GET /settings/api-keys when settings already exist.
    """
    current_test_user = override_auth_for_settings_api
    
    # Create settings directly using CRUD for setup
    initial_keys = {"service_get_api": "key_get_api_val"}
    user_setting_crud.create_user_setting(
        db_session_test, 
        user_id=current_test_user.id, 
        settings=UserSettingSchema(api_keys=initial_keys) # UserSettingCreate schema
    )

    response = client.get("/settings/api-keys")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["api_keys"] == initial_keys
    assert data["user_id"] == current_test_user.id


def test_post_api_keys_create_and_update(client: TestClient, db_session_test: Session, override_auth_for_settings_api):
    """
    Test POST /settings/api-keys:
    - Scenario 1 (No settings): POST new API keys.
    - Scenario 2 (Existing settings): POST to update API keys.
    """
    current_test_user = override_auth_for_settings_api

    # Scenario 1: No settings exist, POST should create them
    keys_to_create = {"service_post_create": "key_post_create_val"}
    response_create = client.post("/settings/api-keys", json={"api_keys": keys_to_create})
    assert response_create.status_code == status.HTTP_200_OK
    data_create = response_create.json()
    assert data_create["api_keys"] == keys_to_create
    assert data_create["user_id"] == current_test_user.id

    # Verify in DB
    db_settings_after_create = user_setting_crud.get_user_setting(db_session_test, user_id=current_test_user.id)
    assert db_settings_after_create is not None
    assert json.loads(db_settings_after_create.api_keys) == keys_to_create

    # Scenario 2: Settings exist, POST should update them
    keys_to_update = {"service_post_update": "key_post_update_val", "another_key": "another_val"}
    response_update = client.post("/settings/api-keys", json={"api_keys": keys_to_update})
    assert response_update.status_code == status.HTTP_200_OK
    data_update = response_update.json()
    assert data_update["api_keys"] == keys_to_update
    assert data_update["user_id"] == current_test_user.id
    
    # Verify in DB
    db_settings_after_update = user_setting_crud.get_user_setting(db_session_test, user_id=current_test_user.id)
    assert db_settings_after_update is not None
    assert json.loads(db_settings_after_update.api_keys) == keys_to_update


def test_delete_api_key(client: TestClient, db_session_test: Session, override_auth_for_settings_api):
    """
    Test DELETE /settings/api-keys/{key_name}:
    - Delete an existing key.
    - Attempt to delete a non-existent key (should 404).
    """
    current_test_user = override_auth_for_settings_api

    # Setup: Create settings with multiple keys
    initial_keys_for_delete = {
        "key_to_delete": "delete_me_val",
        "key_to_keep": "keep_me_val"
    }
    # Use POST to create initial settings via API
    client.post("/settings/api-keys", json={"api_keys": initial_keys_for_delete})

    # Scenario 1: Delete an existing key
    key_name_to_delete = "key_to_delete"
    response_delete_existing = client.delete(f"/settings/api-keys/{key_name_to_delete}")
    assert response_delete_existing.status_code == status.HTTP_200_OK
    data_delete_existing = response_delete_existing.json()
    
    expected_keys_after_delete = {"key_to_keep": "keep_me_val"}
    assert data_delete_existing["api_keys"] == expected_keys_after_delete
    assert data_delete_existing["user_id"] == current_test_user.id

    # Verify in DB
    db_settings_after_delete = user_setting_crud.get_user_setting(db_session_test, user_id=current_test_user.id)
    assert db_settings_after_delete is not None
    assert json.loads(db_settings_after_delete.api_keys) == expected_keys_after_delete

    # Scenario 2: Attempt to delete a non-existent key
    non_existent_key_name = "non_existent_key_123"
    response_delete_non_existent = client.delete(f"/settings/api-keys/{non_existent_key_name}")
    assert response_delete_non_existent.status_code == status.HTTP_404_NOT_FOUND

def test_delete_api_key_no_settings_or_key_not_found(client: TestClient, db_session_test: Session, override_auth_for_settings_api):
    """
    Test DELETE /settings/api-keys/{key_name}:
    - When no settings exist for the user (endpoint logic might create them, then fail to find key -> 404).
    - When settings exist but api_keys field is empty or key not present.
    """
    current_test_user_no_keys = create_and_get_test_user_for_api(db_session_test, "settings_user_no_keys") # Fresh user

    def override_get_current_active_user_no_keys():
        return db_session_test.query(UserModel).filter(UserModel.id == current_test_user_no_keys.id).first()

    client.app.dependency_overrides[get_current_active_user] = override_get_current_active_user_no_keys
    
    # Scenario 1: No settings initially exist for the user.
    # The GET endpoint creates default empty settings. DELETE then tries to delete from empty.
    # First, ensure settings are created by a GET call or similar logic in DELETE endpoint if it exists
    # The router's delete logic fetches settings, if not found it raises 404 early.
    # So, if no settings, it should be 404.
    response_del_key_no_settings = client.delete("/settings/api-keys/some_key")
    assert response_del_key_no_settings.status_code == status.HTTP_404_NOT_FOUND # Because no settings or api_keys is empty

    # Scenario 2: Settings exist, but api_keys is empty
    user_setting_crud.create_user_setting(
        db_session_test, 
        user_id=current_test_user_no_keys.id, 
        settings=UserSettingSchema(api_keys={}) # UserSettingCreate schema
    )
    response_del_key_empty_dict = client.delete("/settings/api-keys/some_key")
    assert response_del_key_empty_dict.status_code == status.HTTP_404_NOT_FOUND

    client.app.dependency_overrides.clear() # Cleanup for this specific override

# Final cleanup if any test-specific override was not in a fixture
@pytest.fixture(autouse=True)
def cleanup_overrides(client: TestClient):
    yield
    client.app.dependency_overrides.clear()

6. /digame/app/tests/crud/test_user_setting_crud.py

import json
import pytest
import random
import string
from sqlalchemy.orm import Session

# Assuming conftest.py is in digame/app/tests/ and provides db_session_test
from digame.app.tests.conftest import db_session_test

from digame.app.models.user import User as UserModel
from digame.app.models.user_setting import UserSetting as UserSettingModel # Ensure this is imported
from digame.app.schemas.user_setting_schemas import UserSettingCreate, UserSettingUpdate
from digame.app.crud import user_setting_crud
# user_crud is not strictly needed if we create UserModel directly as per instructions

# Helper to create a unique user for each test function or case
def create_db_test_user(db: Session, username_prefix: str, email_prefix: str) -> UserModel:
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    test_user = UserModel(
        username=f"{username_prefix}_{random_suffix}",
        email=f"{email_prefix}_{random_suffix}@example.com",
        hashed_password="fake_hashed_password_crud", # Not used by these CRUD tests directly
        is_active=True
    )
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    return test_user

def test_create_user_setting(db_session_test: Session):
    """
    Test creating user settings:
    - With sample API keys.
    - With api_keys=None.
    """
    test_user = create_db_test_user(db_session_test, "crud_create_user", "crud_create_email")
    user_id = test_user.id

    # 1. Test creating with some API keys
    api_keys_data_1 = {"service1_create": "key_data_1", "service2_create": "key_data_2"}
    settings_in_1 = UserSettingCreate(api_keys=api_keys_data_1)
    
    created_settings_1 = user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id, settings=settings_in_1)
    
    assert created_settings_1 is not None
    assert created_settings_1.user_id == user_id
    assert created_settings_1.api_keys is not None # Stored as JSON string
    
    retrieved_api_keys_1 = json.loads(created_settings_1.api_keys)
    assert retrieved_api_keys_1 == api_keys_data_1

    # 2. Test creating with api_keys = None (should store "{}")
    # UserSetting has a unique constraint on user_id. Need a new user or delete existing setting.
    test_user_2 = create_db_test_user(db_session_test, "crud_create_none_user", "crud_create_none_email")
    user_id_2 = test_user_2.id

    settings_in_2 = UserSettingCreate(api_keys=None)
    created_settings_2 = user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id_2, settings=settings_in_2)
    
    assert created_settings_2 is not None
    assert created_settings_2.user_id == user_id_2
    assert created_settings_2.api_keys is not None # Stored as JSON string
    retrieved_api_keys_2 = json.loads(created_settings_2.api_keys)
    assert retrieved_api_keys_2 == {}

def test_get_user_setting(db_session_test: Session):
    """
    Test retrieving user settings:
    - For a user with existing settings.
    - For a user without settings (should return None).
    """
    # 1. User without settings
    test_user_no_settings = create_db_test_user(db_session_test, "crud_get_no_settings_user", "crud_get_no_settings_email")
    retrieved_settings_none = user_setting_crud.get_user_setting(db=db_session_test, user_id=test_user_no_settings.id)
    assert retrieved_settings_none is None

    # 2. User with existing settings
    test_user_with_settings = create_db_test_user(db_session_test, "crud_get_with_settings_user", "crud_get_with_settings_email")
    user_id_with_settings = test_user_with_settings.id
    api_keys_data = {"service_get_exist": "key_get_exist_val"}
    settings_in = UserSettingCreate(api_keys=api_keys_data)
    user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id_with_settings, settings=settings_in)

    retrieved_settings_exists = user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_with_settings)
    assert retrieved_settings_exists is not None
    assert retrieved_settings_exists.user_id == user_id_with_settings
    stored_api_keys = json.loads(retrieved_settings_exists.api_keys)
    assert stored_api_keys == api_keys_data

def test_update_user_setting(db_session_test: Session):
    """
    Test updating user settings:
    - Update existing api_keys.
    - Set api_keys to None (should store "{}").
    - Set api_keys to an empty dict (should store "{}").
    """
    test_user = create_db_test_user(db_session_test, "crud_update_user", "crud_update_email")
    user_id = test_user.id

    # Initial creation
    initial_api_keys = {"initial_key_update": "initial_value_update"}
    settings_create = UserSettingCreate(api_keys=initial_api_keys)
    user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id, settings=settings_create)

    # 1. Update existing api_keys
    updated_api_keys_1 = {"updated_key_1": "updated_value_1", "new_key_1": "new_value_1"}
    settings_update_1 = UserSettingUpdate(api_keys=updated_api_keys_1)
    updated_db_settings_1 = user_setting_crud.update_user_setting(db=db_session_test, user_id=user_id, settings=settings_update_1)
    assert updated_db_settings_1 is not None
    assert json.loads(updated_db_settings_1.api_keys) == updated_api_keys_1

    # 2. Set api_keys to None (should store "{}")
    settings_update_2 = UserSettingUpdate(api_keys=None)
    updated_db_settings_2 = user_setting_crud.update_user_setting(db=db_session_test, user_id=user_id, settings=settings_update_2)
    assert updated_db_settings_2 is not None
    assert json.loads(updated_db_settings_2.api_keys) == {}

    # 3. Set api_keys to an empty dict (should store "{}")
    settings_update_3 = UserSettingUpdate(api_keys={})
    updated_db_settings_3 = user_setting_crud.update_user_setting(db=db_session_test, user_id=user_id, settings=settings_update_3)
    assert updated_db_settings_3 is not None
    assert json.loads(updated_db_settings_3.api_keys) == {}

def test_delete_user_setting(db_session_test: Session):
    """
    Test deleting user settings:
    - Delete existing settings.
    - Test deleting non-existent settings (should return False).
    """
    test_user_del_existing = create_db_test_user(db_session_test, "crud_del_existing_user", "crud_del_existing_email")
    user_id_del_existing = test_user_del_existing.id

    # 1. Create and then delete settings
    api_keys_data = {"service_delete": "key_delete_val"}
    settings_in = UserSettingCreate(api_keys=api_keys_data)
    user_setting_crud.create_user_setting(db=db_session_test, user_id=user_id_del_existing, settings=settings_in)
    
    # Verify creation
    assert user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_del_existing) is not None
    
    delete_result_true = user_setting_crud.delete_user_setting(db=db_session_test, user_id=user_id_del_existing)
    assert delete_result_true is True
    assert user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_del_existing) is None

    # 2. Test deleting non-existent settings
    test_user_del_non_existent = create_db_test_user(db_session_test, "crud_del_non_existent_user", "crud_del_non_existent_email")
    user_id_del_non_existent = test_user_del_non_existent.id
    # Ensure no settings exist for this user
    assert user_setting_crud.get_user_setting(db=db_session_test, user_id=user_id_del_non_existent) is None
    
    delete_result_false = user_setting_crud.delete_user_setting(db=db_session_test, user_id=user_id_del_non_existent)
    assert delete_result_false is False

7. /digame/app/schemas/user_setting_schemas.py

from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field

class UserSettingBase(BaseModel):
    """
    Base schema for user settings.
    """
    api_keys: Optional[Dict[str, str]] = Field(None, description="Dictionary to store API keys, e.g., {'service_name': 'key_value'}")

class UserSettingCreate(UserSettingBase):
    """
    Schema for creating new user settings.
    Inherits all fields from UserSettingBase.
    """
    pass

class UserSettingUpdate(UserSettingBase):
    """
    Schema for updating existing user settings.
    Inherits all fields from UserSettingBase.
    All fields are optional by nature of Pydantic update models.
    """
    pass

class UserSetting(UserSettingBase):
    """
    Schema for returning user settings, including database-generated fields.
    """
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

8. /digame/app/schemas/onboarding_schemas.py

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class OnboardingStep(BaseModel):
    """
    Represents a single step in the onboarding process.
    """
    step_id: str = Field(..., description="Unique identifier for the onboarding step.")
    completed_at: Optional[datetime] = Field(None, description="Timestamp when the step was completed.")
    # metadata: Optional[Dict[str, Any]] = Field(None, description="Any additional data collected at this step.")

class OnboardingDataBase(BaseModel):
    """
    Base schema for user's onboarding data.
    This structure will be stored as a JSON string in User.onboarding_data.
    """
    current_step_id: Optional[str] = Field(None, description="The ID of the current or last visited onboarding step.")
    completed_steps: List[OnboardingStep] = Field([], description="List of completed onboarding steps.")
    user_preferences: Dict[str, Any] = Field({}, description="User preferences collected during onboarding (e.g., notification settings, content preferences).")
    goals: Optional[Dict[str, Any]] = Field(None, description="User-defined goals or objectives (e.g., learning targets, feature usage goals).")
    feature_exploration: Optional[Dict[str, bool]] = Field(None, description="Tracks if user has explored key features (e.g., {'feature_x_explored': True}).")
    is_completed: bool = Field(False, description="Flag indicating if the entire onboarding process has been completed.")
    
    # version: Optional[str] = "1.0" # To manage future changes to this schema

class OnboardingDataCreate(OnboardingDataBase):
    """
    Schema for creating new onboarding data.
    Typically used when a user starts onboarding or when data is first initialized.
    """
    pass

class OnboardingDataUpdate(BaseModel):
    """
    Schema for updating existing onboarding data.
    All fields are optional for partial updates.
    """
    current_step_id: Optional[str] = Field(None, description="The ID of the current or last visited onboarding step.")
    completed_steps: Optional[List[OnboardingStep]] = Field(None, description="List of completed onboarding steps. Send full list to update.")
    user_preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences collected during onboarding.")
    goals: Optional[Dict[str, Any]] = Field(None, description="User-defined goals or objectives.")
    feature_exploration: Optional[Dict[str, bool]] = Field(None, description="Tracks if user has explored key features.")
    is_completed: Optional[bool] = Field(None, description="Flag indicating if the entire onboarding process has been completed.")

class OnboardingDataResponse(OnboardingDataBase):
    """
    Schema for returning onboarding data to the client.
    Includes all fields from OnboardingDataBase.
    """
    user_id: int # For context, linking back to the user

    class Config:
        orm_mode = True # Though this schema is not directly mapped from User.onboarding_data as a whole ORM object.
                        # It's constructed. Still, good practice.

9. /digame/app/schemas/__init__.py

# This file makes 'schemas' a Python package.

# Optionally, import schemas for easier access, e.g.:
from .rbac_schemas import RoleCreate, RoleResponse, PermissionCreate, PermissionResponse, UserRoleAssignRequest, RolePermissionAssignRequest # etc.
# from .user_schemas import UserCreate, UserResponse # Assuming user_schemas.py exists
from .process_note_schemas import ProcessNoteResponse, ProcessDiscoveryResponse, ProcessNoteFeedbackUpdate
from .anomaly_schemas import DetectedAnomalyResponse, DetectedAnomalyBase
from .task_schemas import TaskBase, TaskCreate, TaskUpdate, TaskResponse # Added new task schemas
from .user_setting_schemas import UserSettingBase, UserSettingCreate, UserSettingUpdate, UserSetting # Import new UserSetting schemas
from .onboarding_schemas import OnboardingDataBase, OnboardingDataCreate, OnboardingDataUpdate, OnboardingDataResponse, OnboardingStep # Import new onboarding schemas

__all__ = [
    "RoleCreate", "RoleResponse",
    "PermissionCreate", "PermissionResponse",
    "UserRoleAssignRequest", "RolePermissionAssignRequest",
    # Add other RBAC schemas if needed
    "ProcessNoteResponse",
    "ProcessDiscoveryResponse",
    "ProcessNoteFeedbackUpdate",
    "DetectedAnomalyBase",
    "DetectedAnomalyResponse",
    "TaskBase", "TaskCreate", "TaskUpdate", "TaskResponse", # Added new task schemas
    "UserSettingBase", "UserSettingCreate", "UserSettingUpdate", "UserSetting", # Add UserSetting schemas to __all__
    "OnboardingDataBase", "OnboardingDataCreate", "OnboardingDataUpdate", "OnboardingDataResponse", "OnboardingStep", # Add onboarding schemas to __all__
]

10. /digame/app/routers/user_setting_router.py

import json
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from digame.app.db import get_db
from digame.app.auth.auth_dependencies import get_current_active_user
from digame.app.models.user import User as UserModel # Renamed to avoid confusion with User schema
from digame.app.schemas import user_setting_schemas as schemas # Alias for clarity
from digame.app.crud import user_setting_crud as crud # Alias for clarity

router = APIRouter(
    prefix="/settings",
    tags=["User Settings"],
)

def _parse_api_keys(api_keys_json: Optional[str]) -> Dict[str, str]:
    """Helper function to parse JSON string api_keys to Dict."""
    if not api_keys_json:
        return {}
    try:
        return json.loads(api_keys_json)
    except json.JSONDecodeError:
        # Or handle error appropriately, e.g., log it and return empty
        return {}

@router.get("/api-keys", response_model=schemas.UserSetting)
def get_api_keys(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Retrieves API keys for the current user.
    If settings don't exist, they are created with empty API keys.
    """
    db_user_settings = crud.get_user_setting(db, user_id=current_user.id)
    if not db_user_settings:
        db_user_settings = crud.create_user_setting(
            db, user_id=current_user.id, settings=schemas.UserSettingCreate(api_keys={})
        )
    
    # Manually parse api_keys from JSON string to Dict for the response
    api_keys_dict = _parse_api_keys(db_user_settings.api_keys)
    
    # Construct the response, overriding the (potentially string) api_keys from the model
    return schemas.UserSetting(
        id=db_user_settings.id,
        user_id=db_user_settings.user_id,
        api_keys=api_keys_dict,
        created_at=db_user_settings.created_at,
        updated_at=db_user_settings.updated_at
    )

@router.post("/api-keys", response_model=schemas.UserSetting)
def update_api_keys(
    api_key_data: schemas.UserSettingUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Sets or updates API keys for the current user.
    This will overwrite all keys if provided, or update specific ones if the schema supports it.
    Currently, UserSettingUpdate replaces the entire api_keys field.
    """
    db_user_settings = crud.get_user_setting(db, user_id=current_user.id)
    if db_user_settings:
        updated_settings = crud.update_user_setting(
            db, user_id=current_user.id, settings=api_key_data
        )
    else:
        # Convert UserSettingUpdate to UserSettingCreate for creation
        # This assumes api_key_data contains all necessary fields for creation if settings don't exist
        # or that UserSettingCreate can handle potentially partial data if api_key_data is partial.
        # For robust behavior, ensure api_key_data is suitable for UserSettingCreate.
        # A common pattern is UserSettingCreate(**api_key_data.dict(exclude_unset=True))
        # but UserSettingCreate expects api_keys, so if it's not in api_key_data, it will be default.
        create_data = schemas.UserSettingCreate(api_keys=api_key_data.api_keys if api_key_data.api_keys is not None else {})
        updated_settings = crud.create_user_setting(
            db, user_id=current_user.id, settings=create_data
        )
    
    if not updated_settings: # Should not happen if create/update is successful
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update API keys")

    api_keys_dict = _parse_api_keys(updated_settings.api_keys)
    return schemas.UserSetting(
        id=updated_settings.id,
        user_id=updated_settings.user_id,
        api_keys=api_keys_dict,
        created_at=updated_settings.created_at,
        updated_at=updated_settings.updated_at
    )

@router.delete("/api-keys/{key_name}", response_model=schemas.UserSetting)
def delete_api_key(
    key_name: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user),
):
    """
    Deletes a specific API key by its name for the current user.
    """
    db_user_settings = crud.get_user_setting(db, user_id=current_user.id)
    if not db_user_settings or not db_user_settings.api_keys:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found or no API keys set")

    api_keys_dict = _parse_api_keys(db_user_settings.api_keys)

    if key_name not in api_keys_dict:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"API key '{key_name}' not found")

    del api_keys_dict[key_name]

    # Prepare data for update_user_setting
    update_schema = schemas.UserSettingUpdate(api_keys=api_keys_dict)
    updated_settings = crud.update_user_setting(
        db, user_id=current_user.id, settings=update_schema
    )

    if not updated_settings: # Should ideally not happen if the original setting existed
         raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update API keys after deletion")

    # api_keys_dict is already the state we want for the response
    return schemas.UserSetting(
        id=updated_settings.id,
        user_id=updated_settings.user_id,
        api_keys=api_keys_dict, # Use the locally modified dict for response
        created_at=updated_settings.created_at,
        updated_at=updated_settings.updated_at
    )

11. /digame/app/routers/auth_router.py

This router provides comprehensive authentication endpoints including:
- User registration and login
- Token refresh and logout
- Password reset functionality
- User profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
import logging

from ..auth.auth_service import auth_service
from ..auth.auth_dependencies import get_current_active_user
from ..db import get_db
from ..schemas.user_schemas import UserCreate, User as UserSchema
from ..schemas import onboarding_schemas # Import new onboarding schemas
from ..crud import onboarding_crud # Import new onboarding CRUD
from ..models.user import User

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
    responses={404: {"description": "Not found"}},
)

# Pydantic models for request/response
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class UserRegistrationResponse(BaseModel):
    user: UserSchema
    tokens: TokenResponse

class LoginResponse(BaseModel):
    user: UserSchema
    tokens: TokenResponse

@router.post("/register", response_model=UserRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserRegistrationResponse:
    """
    Register a new user
    
    - **username**: Unique username
    - **email**: Valid email address
    - **password**: Strong password
    - **first_name**: Optional first name
    - **last_name**: Optional last name
    """
    try:
        user, tokens = auth_service.register_user(db, user_data)
        
        return UserRegistrationResponse(
            user=user,
            tokens=TokenResponse(**tokens)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=LoginResponse)
async def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> LoginResponse:
    """
    Login with username/email and password
    
    - **username**: Username or email address
    - **password**: User password
    """
    try:
        user, tokens = auth_service.authenticate_user(
            db, 
            form_data.username, 
            form_data.password
        )
        
        return LoginResponse(
            user=user,
            tokens=TokenResponse(**tokens)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_request: RefreshTokenRequest
) -> TokenResponse:
    """
    Refresh access token using refresh token
    
    - **refresh_token**: Valid refresh token
    """
    try:
        new_tokens = auth_service.refresh_token(refresh_request.refresh_token)
        return TokenResponse(**new_tokens)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(
    refresh_token: str = Form(...),
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout user by blacklisting tokens
    
    - **refresh_token**: User's refresh token
    """
    try:
        # Get access token from the dependency (this is a simplified approach)
        # In a real implementation, you'd extract the token from the Authorization header
        auth_service.logout_user("", refresh_token)
        return {"message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.post("/password-reset/request", status_code=status.HTTP_200_OK)
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Request password reset
    
    - **email**: Email address of the account
    """
    try:
        reset_token = auth_service.initiate_password_reset(db, reset_request.email)
        
        # In a real application, you would send this token via email
        # For demo purposes, we return it (DON'T do this in production!)
        return {
            "message": "Password reset email sent",
            "reset_token": reset_token  # Remove this in production!
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )

@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
async def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Confirm password reset with token
    
    - **token**: Password reset token
    - **new_password**: New password
    """
    try:
        success = auth_service.reset_password(
            db, 
            reset_data.token, 
            reset_data.new_password
        )
        
        if success:
            return {"message": "Password reset successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset failed"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset confirm error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset confirmation failed"
        )

@router.post("/password-change", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Change user password (requires current password)
    
    - **current_password**: Current password
    - **new_password**: New password
    """
    try:
        success = auth_service.change_password(
            db,
            getattr(current_user, 'id'),
            password_data.current_password,
            password_data.new_password
        )
        
        if success:
            return {"message": "Password changed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password change failed"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
) -> UserSchema:
    """
    Get current user information
    """
    return UserSchema.from_orm(current_user)

@router.get("/verify-token", status_code=status.HTTP_200_OK)
async def verify_token(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Verify if the current token is valid
    """
    return {
        "valid": True,
        "user_id": getattr(current_user, 'id'),
        "username": getattr(current_user, 'username'),
        "email": getattr(current_user, 'email')
    }

@router.post("/me/onboarding", response_model=onboarding_schemas.OnboardingDataResponse, status_code=status.HTTP_200_OK)
async def save_onboarding_data(
    onboarding_data_update: onboarding_schemas.OnboardingDataUpdate, # Use new schema for request body
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> onboarding_schemas.OnboardingDataResponse:
    """
    Save or update user onboarding data using structured Pydantic models.
    """
    try:
        user_id = getattr(current_user, 'id')
        updated_onboarding_data = onboarding_crud.update_onboarding_data(
            db=db, user_id=user_id, data_update=onboarding_data_update
        )
        if not updated_onboarding_data: # Should be handled by CRUD if user not found, but as a safeguard
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found, cannot update onboarding data.")
        return updated_onboarding_data
    except ValueError as ve: # Catch specific error from CRUD if user not found
        logger.error(f"Error saving onboarding data for user {current_user.id}: {str(ve)}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        logger.error(f"Error saving onboarding data for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save onboarding data"
        )

@router.get("/me/onboarding", response_model=onboarding_schemas.OnboardingDataResponse, status_code=status.HTTP_200_OK)
async def get_onboarding_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> onboarding_schemas.OnboardingDataResponse:
    """
    Get user onboarding status and data using structured Pydantic models.
    """
    try:
        user_id = getattr(current_user, 'id')
        onboarding_data_response = onboarding_crud.get_onboarding_data(db=db, user_id=user_id)
        if not onboarding_data_response:
            # This case should ideally be handled by get_onboarding_data returning a default structure
            # or raising an error if user is not found, which it should not if current_user is valid.
            # If get_onboarding_data returns None only if user itself not found by user_crud.get_user
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found, cannot retrieve onboarding data.")
        return onboarding_data_response
    except Exception as e:
        logger.error(f"Error getting onboarding status for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get onboarding status"
        )

# Health check endpoint
@router.get("/health", status_code=status.HTTP_200_OK)
async def auth_health_check() -> Dict[str, str]:
    """
    Authentication service health check
    """
    return {"status": "healthy", "service": "authentication"}

12. /digame/app/routers/__init__.py

# This file makes 'routers' a Python package.

# Optionally, import routers for easier access in main.py, e.g.:
# from .admin_rbac_router import router as admin_rbac_router
# from .predictive_router import router as predictive_router # Assuming predictive_router.py exists
from .user_setting_router import router as user_setting_router # Import the new user setting router

13. /digame/app/models/user_setting.py

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from .user import Base  # Import Base from user.py

class UserSetting(Base):
    __tablename__ = 'user_settings'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, index=True)
    api_keys = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="settings")

14. /digame/app/models/user.py

rom sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

# Removed: from .user_setting import UserSetting # This caused a circular import

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer(), primary_key=True, index=True)
    username = Column(String(), unique=True, index=True, nullable=False)
    email = Column(String(), unique=True, index=True, nullable=False)
    hashed_password = Column(String(), nullable=False)
    
    first_name = Column(String(), nullable=True)
    last_name = Column(String(), nullable=True)
    
    created_at = Column(DateTime(), default=datetime.utcnow)
    updated_at = Column(DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    is_active = Column(Integer(), default=True) # Using Integer for broader DB compatibility (e.g. 0 or 1)
    
    # Onboarding fields
    onboarding_completed = Column(Boolean(), default=False)
    onboarding_data = Column(Text(), nullable=True)  # JSON string for onboarding data

    # Relationship to Role via user_roles_table
    # The 'secondary' argument refers to the __tablename__ of the association table.
    # This table (user_roles) will be defined in rbac.py.
    roles = relationship(
        "Role",
        secondary="user_roles", 
        back_populates="users"  # Corresponds to the 'users' attribute in the Role model
    )

    # Relationship to ProcessNote model
    # This allows accessing all process notes associated with a user.
    process_notes = relationship(
        "ProcessNote", # String reference to the ProcessNote class
        back_populates="user", # Corresponds to the 'user' attribute in ProcessNote
        cascade="all, delete-orphan" # If a user is deleted, their process notes are also deleted.
    )

    # Relationship to Activity model
    # Allows accessing all activities associated with a user.
    activities = relationship(
        "Activity", # String reference to the Activity class
        back_populates="user", # Corresponds to the 'user' attribute in Activity
        cascade="all, delete-orphan" # If a user is deleted, their activities are also deleted.
    )

    # Relationship to DetectedAnomaly model
    # Allows accessing all anomalies detected for a user.
    anomalies = relationship(
        "DetectedAnomaly", # String reference to the DetectedAnomaly class
        back_populates="user", # Corresponds to the 'user' attribute in DetectedAnomaly
        cascade="all, delete-orphan" # If a user is deleted, their anomalies are also deleted.
    )

    # Relationship to Task model
    # Allows accessing all tasks assigned to or created by a user.
    tasks = relationship(
        "Task", # String reference to the Task class
        back_populates="user", # Corresponds to the 'user' attribute in Task
        cascade="all, delete-orphan" # If a user is deleted, their tasks are also deleted.
    )
    
    # Relationship to BehavioralModel model
    # Allows accessing all behavioral models created for a user.
    behavioral_models = relationship(
        "BehavioralModel", # String reference to the BehavioralModel class
        back_populates="user", # Corresponds to the 'user' attribute in BehavioralModel
        cascade="all, delete-orphan" # If a user is deleted, their behavioral models are also deleted.
    )

    # Relationship to UserSetting model
    # This allows accessing the user's settings.
    settings = relationship(
        "UserSetting",
        back_populates="user",
        uselist=False, # One-to-one relationship
        cascade="all, delete-orphan" # If a user is deleted, their settings are also deleted.
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"

15. /digame/app/models/__init__.py

# This file makes 'models' a package.

# Import all SQLAlchemy models to make them accessible via this package
# and to ensure they are registered with Base.metadata for Alembic discovery
# if env.py imports this models package.

from .user import User, Base # Base is often defined in one model file (e.g., user.py) or a database.py
from .rbac import Role, Permission, user_roles_table, role_permissions_table
from .process_notes import ProcessNote
from .activity import Activity 
from .activity_features import ActivityEnrichedFeature
from .anomaly import DetectedAnomaly
from .task import Task # Added new model
from .user_setting import UserSetting # Import the new UserSetting model

# Optionally, define __all__ to specify what is exported when 'from .models import *' is used
__all__ = [
    "User",
    "Base", # Exporting Base can be useful
    "Role",
    "Permission",
    "user_roles_table",
    "role_permissions_table",
    "ProcessNote",
    "Activity",
    "ActivityEnrichedFeature",
    "DetectedAnomaly",
    "Task", # Added new model
    "UserSetting", # Add UserSetting to __all__
]

16. /digame/app/main.py

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import routers
from .routers import predictive as predictive_router
from .routers import admin_rbac_router
from .routers import admin_router
from .routers import analytics_router
from .routers import process_notes_router
from .routers import behavior as behavior_router
from .routers import pattern_recognition_router
from .routers import job_router
from .routers import publish_router
from .routers import auth_router  # Import the new authentication router
from .routers import onboarding_router
from .routers import user_setting_router # Import the user setting router

# Import authentication components
from .auth.middleware import configure_auth_middleware
from .auth.config import auth_settings, get_middleware_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI application with enhanced metadata
app = FastAPI(
    title="Digame API",
    description="""
    ## Digame - Digital Professional Twin Platform
    
    A comprehensive platform for behavioral analysis, predictive modeling, and professional development.
    
    ### Features:
    - 🔐 **Authentication & Authorization**: JWT-based auth with RBAC
    - 🧠 **Behavioral Analysis**: Advanced behavior modeling and pattern recognition
    - 📊 **Predictive Modeling**: Machine learning-powered predictions
    - 📝 **Process Notes**: Comprehensive documentation system
    - 🔄 **Background Jobs**: Asynchronous task processing
    - 📤 **Publishing**: Model and data publishing capabilities
    
    ### Authentication:
    - Register at `/auth/register`
    - Login at `/auth/login`
    - Use Bearer token in Authorization header for protected endpoints
    """,
    version="1.0.0",
    contact={
        "name": "Digame Platform",
        "email": "support@digame.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "User authentication and authorization endpoints"
        },
        {
            "name": "Predictive Modeling",
            "description": "Machine learning and predictive analytics"
        },
        {
            "name": "Behavior Recognition",
            "description": "Behavioral analysis and pattern recognition"
        },
        {
            "name": "Process Notes",
            "description": "Documentation and process management"
        },
        {
            "name": "Admin RBAC Management",
            "description": "Role-based access control administration"
        },
        {
            "name": "Background Jobs",
            "description": "Asynchronous task processing"
        },
        {
            "name": "Publishing",
            "description": "Model and data publishing"
        }
    ]
)

# Configure authentication middleware
logger.info("Configuring authentication middleware...")
middleware_config = get_middleware_config()
configure_auth_middleware(app, middleware_config)

# Include authentication router first (no authentication required)
app.include_router(auth_router.router, tags=["Authentication"])

# Include other routers (these will be protected by authentication middleware)
app.include_router(user_setting_router.router) # Add user setting router
app.include_router(predictive_router.router, prefix="/predictive", tags=["Predictive Modeling"])
app.include_router(admin_rbac_router.router, prefix="/admin/rbac", tags=["Admin RBAC Management"])
app.include_router(admin_router.router, prefix="/api", tags=["Admin Dashboard"])
app.include_router(analytics_router.router, prefix="/api", tags=["Analytics"])
app.include_router(process_notes_router.router, prefix="/process-notes", tags=["Process Notes"])
app.include_router(behavior_router.router, prefix="/behavior", tags=["Behavior Recognition"])
app.include_router(pattern_recognition_router.router, prefix="/pattern-recognition", tags=["Pattern Recognition"])
app.include_router(job_router.router, prefix="/api", tags=["Background Jobs"])
app.include_router(publish_router.router, prefix="/publish", tags=["Publishing"])
app.include_router(onboarding_router.router, tags=["Onboarding"])

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("🚀 Starting Digame API...")
    logger.info(f"📊 API Version: {app.version}")
    logger.info(f"🔐 Authentication: {'Enabled' if auth_settings.auth_middleware_enabled else 'Disabled'}")
    logger.info(f"🛡️  Rate Limiting: {'Enabled' if auth_settings.rate_limit_enabled else 'Disabled'}")
    logger.info(f"🌐 CORS: {'Enabled' if auth_settings.cors_enabled else 'Disabled'}")
    
    # Initialize authentication database if configured
    if auth_settings.create_default_roles:
        try:
            from .auth.init_auth_db import initialize_auth_database
            from .db import get_db
            
            db = next(get_db())
            success = initialize_auth_database(db)
            db.close()
            
            if success:
                logger.info("✅ Authentication database initialized successfully")
            else:
                logger.warning("⚠️  Authentication database initialization failed")
        except Exception as e:
            logger.error(f"❌ Authentication database initialization error: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("🛑 Shutting down Digame API...")

# Health check endpoints
@app.get("/", tags=["Health"])
async def read_root():
    """Root endpoint with basic API information"""
    return {
        "message": "Welcome to the Digame API",
        "version": app.version,
        "title": app.title,
        "description": "Digital Professional Twin Platform",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "authentication": {
            "login_url": "/auth/login",
            "register_url": "/auth/register",
            "docs": "/auth/health"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Comprehensive health check endpoint"""
    return {
        "status": "healthy",
        "service": "digame-api",
        "version": app.version,
        "timestamp": "2025-05-23T11:02:00Z",
        "components": {
            "authentication": "operational",
            "database": "operational",
            "middleware": "operational"
        }
    }

@app.get("/info", tags=["Health"])
async def api_info():
    """Detailed API information"""
    return {
        "title": app.title,
        "description": app.description,
        "version": app.version,
        "contact": app.contact,
        "license_info": app.license_info,
        "endpoints": {
            "authentication": "/auth/*",
            "predictive": "/predictive/*",
            "behavior": "/behavior/*",
            "process_notes": "/process-notes/*",
            "admin": "/admin/*",
            "jobs": "/api/*",
            "publishing": "/publish/*"
        },
        "features": [
            "JWT Authentication",
            "Role-Based Access Control",
            "Behavioral Analysis",
            "Predictive Modeling",
            "Process Documentation",
            "Background Job Processing",
            "Model Publishing"
        ]
    }

# Request context middleware for debugging
@app.middleware("http")
async def add_request_context(request: Request, call_next):
    """Add request context for debugging and monitoring"""
    import time
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    # Add timing header
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log slow requests
    if process_time > 1.0:  # Log requests taking more than 1 second
        logger.warning(f"Slow request: {request.method} {request.url} took {process_time:.2f}s")
    
    return response

# Exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler"""
    return {
        "error": "Not Found",
        "message": f"The requested resource {request.url.path} was not found",
        "status_code": 404,
        "suggestion": "Check the API documentation at /docs for available endpoints"
    }

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Custom 500 handler"""
    logger.error(f"Internal server error on {request.method} {request.url}: {exc}")
    return {
        "error": "Internal Server Error",
        "message": "An unexpected error occurred",
        "status_code": 500,
        "suggestion": "Please try again later or contact support"
    }

# Development server runner
if __name__ == "__main__":
    import uvicorn
    
    logger.info("🔧 Starting development server...")
    uvicorn.run(
        "digame.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


17. /digame/app/crud/user_setting_crud.py

import json
from typing import Optional, Dict

from sqlalchemy.orm import Session

from digame.app import models # Assuming models.__init__ exports UserSetting
from digame.app import schemas # Assuming schemas.__init__ exports UserSetting schemas

def get_user_setting(db: Session, user_id: int) -> Optional[models.UserSetting]:
    """
    Retrieves UserSetting for a given user_id.
    """
    return db.query(models.UserSetting).filter(models.UserSetting.user_id == user_id).first()

def create_user_setting(db: Session, user_id: int, settings: schemas.UserSettingCreate) -> models.UserSetting:
    """
    Creates a new UserSetting record associated with user_id.
    """
    api_keys_json = None
    if settings.api_keys is not None:
        api_keys_json = json.dumps(settings.api_keys)
    else:
        api_keys_json = json.dumps({}) # Store as empty JSON object string if None

    db_user_setting = models.UserSetting(
        user_id=user_id,
        api_keys=api_keys_json
    )
    db.add(db_user_setting)
    db.commit()
    db.refresh(db_user_setting)
    return db_user_setting

def update_user_setting(db: Session, user_id: int, settings: schemas.UserSettingUpdate) -> Optional[models.UserSetting]:
    """
    Updates an existing UserSetting for user_id.
    Handles partial updates.
    """
    db_user_setting = get_user_setting(db, user_id=user_id)
    if not db_user_setting:
        return None

    update_data = settings.dict(exclude_unset=True)

    if 'api_keys' in update_data:
        if update_data['api_keys'] is not None:
            db_user_setting.api_keys = json.dumps(update_data['api_keys'])
        else:
            db_user_setting.api_keys = json.dumps({}) # Store as empty JSON object string if None

    # Apply other updates if any (though UserSettingBase only has api_keys for now)
    for key, value in update_data.items():
        if key != 'api_keys': # api_keys handled above
            setattr(db_user_setting, key, value)
            
    db.commit()
    db.refresh(db_user_setting)
    return db_user_setting

def delete_user_setting(db: Session, user_id: int) -> bool:
    """
    Deletes UserSetting for user_id. Returns True if deleted, False otherwise.
    """
    db_user_setting = get_user_setting(db, user_id=user_id)
    if db_user_setting:
        db.delete(db_user_setting)
        db.commit()
        return True
    return False

17. /digame/app/crud/onboarding_crud.py

import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from digame.app.models.user import User as UserModel
from digame.app.schemas import onboarding_schemas as schemas # Alias for clarity
from digame.app.crud import user_crud # To fetch user

def get_onboarding_data(db: Session, user_id: int) -> Optional[schemas.OnboardingDataResponse]:
    """
    Retrieves and parses onboarding data for a given user_id.
    If no data exists or is invalid JSON, it might return default/empty onboarding data.
    """
    db_user = user_crud.get_user(db, user_id=user_id)
    if not db_user:
        return None # Or raise HTTPException if user not found is an error here

    if not db_user.onboarding_data:
        # Return a default/empty OnboardingDataResponse if no data is stored
        # This ensures the frontend always gets a consistent structure.
        default_data = schemas.OnboardingDataBase().dict()
        return schemas.OnboardingDataResponse(user_id=user_id, **default_data)

    try:
        onboarding_data_dict = json.loads(db_user.onboarding_data)
        # Validate and structure it with Pydantic model
        # This ensures that even if DB has partial/old data, it's structured.
        parsed_data = schemas.OnboardingDataBase(**onboarding_data_dict)
    except (json.JSONDecodeError, TypeError): # TypeError for None if somehow saved
        # If data is corrupted or not valid JSON, return default/empty
        default_data = schemas.OnboardingDataBase().dict()
        return schemas.OnboardingDataResponse(user_id=user_id, **default_data)
    
    return schemas.OnboardingDataResponse(user_id=user_id, **parsed_data.dict())


def update_onboarding_data(db: Session, user_id: int, data_update: schemas.OnboardingDataUpdate) -> schemas.OnboardingDataResponse:
    """
    Updates User.onboarding_data (JSON string) and User.onboarding_completed.
    Performs a merge of existing data with new data for partial updates.
    """
    db_user = user_crud.get_user(db, user_id=user_id)
    if not db_user:
        # Depending on requirements, could raise HTTPException or return None/error schema
        # For now, let's assume user must exist.
        raise ValueError(f"User with id {user_id} not found.") # Or handle as per project's error strategy

    # Fetch current onboarding data or initialize if none exists
    current_onboarding_data_dict: Dict[str, Any] = {}
    if db_user.onboarding_data:
        try:
            current_onboarding_data_dict = json.loads(db_user.onboarding_data)
        except (json.JSONDecodeError, TypeError):
            current_onboarding_data_dict = {} # Start fresh if corrupted

    # Convert Pydantic update model to dict, excluding unset fields for partial update
    update_data_dict = data_update.dict(exclude_unset=True)

    # Merge logic:
    # For nested dicts like 'user_preferences', 'goals', 'feature_exploration', merge them.
    # For 'completed_steps', replace if provided, otherwise keep current.
    # For 'current_step_id' and 'is_completed', replace if provided.

    merged_data_dict = current_onboarding_data_dict.copy()

    if "current_step_id" in update_data_dict:
        merged_data_dict["current_step_id"] = update_data_dict["current_step_id"]
    
    if "completed_steps" in update_data_dict: # Assumes full list of steps is sent
        merged_data_dict["completed_steps"] = [step.dict() for step in data_update.completed_steps] if data_update.completed_steps else []

    if "user_preferences" in update_data_dict and update_data_dict["user_preferences"] is not None:
        if "user_preferences" not in merged_data_dict or not isinstance(merged_data_dict.get("user_preferences"), dict):
            merged_data_dict["user_preferences"] = {}
        merged_data_dict["user_preferences"].update(update_data_dict["user_preferences"])
    
    if "goals" in update_data_dict and update_data_dict["goals"] is not None:
        if "goals" not in merged_data_dict or not isinstance(merged_data_dict.get("goals"), dict):
            merged_data_dict["goals"] = {}
        merged_data_dict["goals"].update(update_data_dict["goals"])

    if "feature_exploration" in update_data_dict and update_data_dict["feature_exploration"] is not None:
        if "feature_exploration" not in merged_data_dict or not isinstance(merged_data_dict.get("feature_exploration"), dict):
            merged_data_dict["feature_exploration"] = {}
        merged_data_dict["feature_exploration"].update(update_data_dict["feature_exploration"])

    if "is_completed" in update_data_dict:
        merged_data_dict["is_completed"] = update_data_dict["is_completed"]
        db_user.onboarding_completed = update_data_dict["is_completed"] # Update the direct User model field

    # Ensure the merged data conforms to OnboardingDataBase schema before saving
    # This also provides default values for fields not present in merged_data_dict
    final_onboarding_data = schemas.OnboardingDataBase(**merged_data_dict)
    db_user.onboarding_data = final_onboarding_data.json() # Pydantic .json() serializes to JSON string

    db.add(db_user) # Add user to session if it wasn't already, or to mark as dirty
    db.commit()
    db.refresh(db_user)

    return schemas.OnboardingDataResponse(user_id=user_id, **final_onboarding_data.dict())

18. /digame/app/crud/__init__.py

# This file makes 'crud' a Python package.

# Import CRUD functions for easier access from services
from .user_crud import (
    get_user, get_user_by_email, get_user_by_username, get_users,
    create_user, update_user, delete_user, authenticate_user
)
from .rbac_crud import (
    create_role, get_role_by_name, get_roles, update_role, delete_role,
    create_permission, get_permission_by_name, get_permissions, update_permission, delete_permission,
    assign_role_to_user_by_names, remove_role_from_user_by_names,
    add_permission_to_role_by_names, remove_permission_from_role_by_names
)
from .process_notes_crud import (
    get_process_note_by_id,
    get_process_notes_by_user_id,
    update_process_note_feedback_tags # Added new function
)
from .job_crud import (
    create_job,
    get_job_by_id,
    get_jobs_for_user,
    update_job_status,
    delete_job
)

__all__ = [
    # User CRUD
    "get_user", "get_user_by_email", "get_user_by_username", "get_users",
    "create_user", "update_user", "delete_user", "authenticate_user",
    
    # RBAC CRUD
    "create_role", "get_role_by_name", "get_roles", "update_role", "delete_role",
    "create_permission", "get_permission_by_name", "get_permissions", "update_permission", "delete_permission",
    "assign_role_to_user_by_names", "remove_role_from_user_by_names",
    "add_permission_to_role_by_names", "remove_permission_from_role_by_names",
    
    # Process Notes CRUD
    "get_process_note_by_id",
    "get_process_notes_by_user_id",
    "update_process_note_feedback_tags", # Added new function
    
    # Job CRUD
    "create_job",
    "get_job_by_id",
    "get_jobs_for_user",
    "update_job_status",
    "delete_job",

    # UserSetting CRUD
    "get_user_setting", "create_user_setting", "update_user_setting", "delete_user_setting",
]



