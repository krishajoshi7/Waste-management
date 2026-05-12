# Data Model

The schema below is intentionally relational and simple for the prototype. It can be implemented in PostgreSQL, Supabase, Firebase with equivalent collections, or any backend framework with SQL support.

## users

Stores login identity and shared user fields.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | text | Person or organization display name |
| phone | text | Unique where possible |
| role | enum | `generator`, `collector`, `admin` |
| address | text | Optional for collectors and admins |
| latitude | decimal | Optional |
| longitude | decimal | Optional |
| created_at | timestamp | Server generated |
| updated_at | timestamp | Server generated |

## generator_profiles

Stores generator-specific profile details.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | Foreign key to `users.id` |
| generator_type | enum | `tailor`, `temple`, `household`, `boutique`, `ngo` |
| preferred_pickup_window | text | Human readable for prototype |
| average_waste_frequency | text | Optional |
| created_at | timestamp | Server generated |
| updated_at | timestamp | Server generated |

## collector_profiles

Stores collector-specific operational details.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| user_id | uuid | Foreign key to `users.id` |
| employee_id | text | Unique internal ID |
| assigned_zone | text | Used by admin assignment |
| vehicle_type | enum | `bike`, `van` |
| created_at | timestamp | Server generated |
| updated_at | timestamp | Server generated |

## waste_requests

Stores pickup requests created by generators.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| generator_id | uuid | Foreign key to `users.id` |
| waste_category | enum | `cloth_scraps`, `sarees`, `kurtas`, `bedsheets`, `temple_cloth`, `mixed_fabric`, `others` |
| quantity_type | enum | `weight`, `bag_count` |
| estimated_weight_kg | decimal | Nullable |
| estimated_bag_count | integer | Nullable |
| condition | enum | `clean`, `mixed`, `wet_soiled` |
| urgency | enum | `normal`, `urgent` |
| pickup_address | text | Snapshot at request time |
| pickup_latitude | decimal | Nullable |
| pickup_longitude | decimal | Nullable |
| notes | text | Optional |
| status | enum | See request status list |
| created_at | timestamp | Server generated |
| updated_at | timestamp | Server generated |

## request_photos

Stores photos uploaded by generators and collectors.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| request_id | uuid | Foreign key to `waste_requests.id` |
| assignment_id | uuid | Nullable foreign key to `pickup_assignments.id` |
| uploaded_by | uuid | Foreign key to `users.id` |
| photo_type | enum | `generator_request`, `collector_pickup`, `warehouse_scale` |
| storage_url | text | Object storage URL or local prototype URL |
| created_at | timestamp | Server generated |

## pickup_assignments

Stores collector assignment and pickup completion data.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| request_id | uuid | Foreign key to `waste_requests.id` |
| collector_id | uuid | Foreign key to `users.id` |
| scheduled_start | timestamp | Nullable until scheduled |
| scheduled_end | timestamp | Nullable until scheduled |
| actual_pickup_time | timestamp | Set on completion |
| actual_quantity_type | enum | `weight`, `bag_count` |
| actual_weight_kg | decimal | Nullable |
| actual_bag_count | integer | Nullable |
| actual_condition | enum | `clean`, `mixed`, `soiled` |
| collector_notes | text | Optional |
| generator_signature_url | text | Optional |
| created_at | timestamp | Server generated |
| updated_at | timestamp | Server generated |

## warehouses

Stores warehouse locations.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| name | text | Warehouse name |
| address | text | Warehouse address |
| latitude | decimal | Nullable |
| longitude | decimal | Nullable |
| created_at | timestamp | Server generated |
| updated_at | timestamp | Server generated |

## warehouse_deliveries

Stores final delivery verification.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| assignment_id | uuid | Foreign key to `pickup_assignments.id` |
| warehouse_id | uuid | Foreign key to `warehouses.id` |
| delivered_items | text | Human-readable prototype summary |
| verified_weight_kg | decimal | Required for reconciliation |
| warehouse_staff_name | text | Required |
| delivery_latitude | decimal | Optional |
| delivery_longitude | decimal | Optional |
| delivered_at | timestamp | Server generated or submitted |
| created_at | timestamp | Server generated |

## status_events

Stores an auditable request timeline.

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Primary key |
| request_id | uuid | Foreign key to `waste_requests.id` |
| status | enum | Current status at event time |
| actor_id | uuid | Foreign key to `users.id` |
| note | text | Optional |
| created_at | timestamp | Server generated |

## Core Relationships

- A generator user has one generator profile.
- A collector user has one collector profile.
- A generator can create many waste requests.
- A waste request can have many photos.
- A waste request has zero or one active pickup assignment in Phase 1.
- A collector can have many pickup assignments.
- A pickup assignment has zero or one warehouse delivery.
- Status changes are recorded in `status_events`.

