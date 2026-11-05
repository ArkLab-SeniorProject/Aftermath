# Database Structure

MongoDB database with 4 collections, accessed via GraphQL API.

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o| situation : "has one"
    users ||--o{ guide : "has many"
    guide }o--|| situation : "references situation"
    guide ||--|{ guide_resources : "contains"
    guide_resources }o--|| resources : "references"

    users {
        ObjectId _id PK
        string username UK
        string email
        string first_name
        string password_hash
        string role "user | admin"
        string reset_password_token
        date reset_password_expires
        date created_at
        date updated_at
    }

    situation {
        ObjectId _id PK
        ObjectId user_id FK
        object location "zip, city, state, state_code, country_code"
        string timeline
        string disasters "comma-separated IDs"
        string display_name
        object help_types "housing, financial, damage booleans"
        string home_status
        array household "string array"
        date created_at
        date updated_at
    }

    resources {
        ObjectId _id PK
        string resource_type "housing | financial | damage-recovery"
        string title
        JSON content
        string guide_type "recovery | preparedness"
        date created_at
        date updated_at
    }

    guide {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId situation FK "references situation collection"
        string guide_type "recovery | preparedness"
        array resources "embedded guide_resources"
        JSON filters
        date created_at
        date updated_at
    }

    guide_resources {
        ObjectId resource_id FK
        JSON progress
        boolean saved
    }
```

## Data Flow

```mermaid
flowchart TD
    subgraph Client ["UI (React + Apollo)"]
        QUIZ[Recovery Quiz]
        LS[(localStorage)]
        DASH[Dashboard]
    end

    subgraph Auth ["Authentication"]
        LOGIN[Login]
        SIGNUP[Create Account]
        JWT[JWT Token]
    end

    subgraph API ["GraphQL API (Apollo Server)"]
        GQL[Schema + Resolvers]
    end

    subgraph DB ["MongoDB"]
        USERS[(users)]
        SIT[(situation)]
        RES[(resources)]
        GUIDES[(guide)]
    end

    QUIZ -->|saves answers| LS
    LS -->|auto-fill name| SIGNUP
    SIGNUP -->|createUser| GQL
    LOGIN -->|login| GQL
    GQL -->|AuthPayload + JWT| JWT
    JWT -->|authenticates requests| GQL

    SIGNUP & LOGIN -->|syncRecoverySituation| GQL
    GQL -->|createSituation| SIT
    LS -->|cleared after sync| LS

    GQL -->|CRUD| USERS
    GQL -->|CRUD| SIT
    GQL -->|CRUD admin-only| RES
    GQL -->|CRUD| GUIDES

    USERS ---|user_id| SIT
    USERS ---|user_id| GUIDES
    SIT ---|disaster ref| GUIDES
    RES ---|resource_id| GUIDES

    DASH -->|getSituationsByUser| GQL
    DASH -->|getGuidesByUser| GQL
```

## Collection Details

### `users`
- **Auth**: password hashed with bcrypt (10 rounds), JWT token for sessions
- **Password reset**: token hashed with SHA-256, 15-min expiry
- **Constraints**: username is unique, one situation per user
- **Access**: users can only read/update their own record; admin can list all

### `situation`
- **Constraint**: one per user (enforced in resolver)
- **Created by**: synced from localStorage quiz answers after login/signup
- **Ownership**: user_id must match authenticated user

### `resources`
- **Admin-only**: only admin role can create/update/delete
- **Public read**: getResource and getResources require no auth
- **Types**: categorized by `resource_type` and `guide_type`

### `guide`
- **Constraint**: one per user per guide_type (recovery or preparedness)
- **Auto-populated**: on creation, resources are matched from the `resources` collection based on the user's help_types filters
- **Embedded subdocuments**: `resources` array contains `{resource_id, progress, saved}` entries referencing the `resources` collection
