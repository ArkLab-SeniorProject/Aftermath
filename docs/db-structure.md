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
        object location "zip, city, state, FIPS, coordinates, precision"
        string timeline
        string disasters "comma-separated IDs"
        string display_name
        array help_types "category keys: home_repair, temporary_housing, belongings_vehicles, money_work, utilities, health_support"
        array help_details "branch answer tags"
        array insurance "ins_home, ins_flood, ins_car, ins_none, ins_unsure"
        string home_status
        boolean primary_residence
        array household "string array"
        boolean fema_applied
        string guest_token_hash
        date created_at
        date updated_at
    }

    resources {
        ObjectId _id PK
        string resource_type "8 category keys"
        string title
        JSON content
        JSON tags "gate, requires, any"
        string source_url
        date last_checked
        JSON section_gates "for example fema: [ia_open]"
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
        JSON fema_status "gate, deadline, fetched_at"
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
        PREP[Preparedness Quiz]
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
    PREP -->|saves answers| LS
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
    GQL -->|getMatchingResources| RES
    GQL -->|CRUD| GUIDES

    USERS ---|user_id| SIT
    USERS ---|user_id| GUIDES
    SIT ---|situation ref| GUIDES
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
- **Matching**: `tags.requires` uses all-match semantics, `tags.any` uses any-match semantics, and `tags.gate` matches the user's FEMA gate.
- **Provenance**: `source_url` and `last_checked` identify the trusted source and review date.

### `guide`
- **Constraint**: one per user per guide_type (recovery or preparedness)
- **Auto-populated**: resources can be matched from the `resources` collection using the GraphQL `getMatchingResources` query and the user's tag list.
- **FEMA status**: `fema_status` stores the gate and refresh metadata used to control FEMA content.
- **Embedded subdocuments**: `resources` array contains `{resource_id, progress, saved}` entries referencing the `resources` collection
