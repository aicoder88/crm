# Pending Database Migrations

This folder contains database migration scripts that have been created but **not yet applied** to the database.

## Purpose

Use this folder to stage migration files that you want to review and apply together as a batch, rather than applying them individually as they're created.

## Workflow

1. **Create** new migration SQL files in this `pending/` directory
2. **Review** all pending migrations together when ready
3. **Apply** them to your database in the correct order
4. **Move** applied migrations to the parent `migrations/` directory or archive them

## Current Pending Migrations

- `add_task_reminders.sql` - Adds task reminder functionality with notification timestamps

## Notes

- Review dependencies between migrations before applying
- Test migrations on a development database first
- Consider the order of execution for related schema changes
- Keep this README updated as you add/remove pending migrations
