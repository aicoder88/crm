-- Migration: Add reminder fields to tasks table
-- Run this in your Supabase SQL Editor

-- Add reminder_time and reminder_sent columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS reminder_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Create index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_tasks_reminder 
ON tasks(reminder_time) 
WHERE status = 'pending' AND reminder_sent = false;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN ('reminder_time', 'reminder_sent');
