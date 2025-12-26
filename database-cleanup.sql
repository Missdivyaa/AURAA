-- ============================================
-- Database Cleanup Queries for AURAA
-- ============================================
-- WARNING: These queries will DELETE ALL DATA from the database
-- Make sure you have a backup before running these!
-- ============================================

-- Option 1: DELETE ALL DATA (Complete Cleanup)
-- Run these queries in order to avoid foreign key constraint errors

-- Step 1: Delete all child records (those with foreign keys)
-- Delete wearable data
DELETE FROM wearable_data;

-- Delete health metrics
DELETE FROM health_metrics;

-- Delete symptom analyses
DELETE FROM symptom_analyses;

-- Delete AI insights
DELETE FROM ai_insights;

-- Delete reminders
DELETE FROM reminders;

-- Delete medications
DELETE FROM medications;

-- Delete appointments
DELETE FROM appointments;

-- Delete health reports
DELETE FROM health_reports;

-- Step 2: Delete family members
DELETE FROM family_members;

-- Step 3: Delete users (optional - only if you want to remove users too)
-- DELETE FROM users;

-- ============================================
-- Option 2: DELETE DATA FOR SPECIFIC USER (Safer)
-- Replace 'YOUR_USER_ID' with your actual user ID
-- ============================================

-- Delete wearable data for specific user
-- DELETE FROM wearable_data WHERE "userId" = 'YOUR_USER_ID';

-- Delete health metrics for specific user
-- DELETE FROM health_metrics WHERE "userId" = 'YOUR_USER_ID';

-- Delete symptom analyses for specific user
-- DELETE FROM symptom_analyses WHERE "userId" = 'YOUR_USER_ID';

-- Delete AI insights for specific user
-- DELETE FROM ai_insights WHERE "userId" = 'YOUR_USER_ID';

-- Delete reminders for specific user
-- DELETE FROM reminders WHERE "userId" = 'YOUR_USER_ID';

-- Delete medications for specific user
-- DELETE FROM medications WHERE "userId" = 'YOUR_USER_ID';

-- Delete appointments for specific user
-- DELETE FROM appointments WHERE "userId" = 'YOUR_USER_ID';

-- Delete health reports for specific user
-- DELETE FROM health_reports WHERE "userId" = 'YOUR_USER_ID';

-- Delete family members for specific user
-- DELETE FROM family_members WHERE "userId" = 'YOUR_USER_ID';

-- ============================================
-- Option 3: TRUNCATE ALL TABLES (Fastest - Resets Auto-increment)
-- WARNING: This will reset sequences and cannot be rolled back!
-- ============================================

-- Disable foreign key checks temporarily (PostgreSQL)
-- SET session_replication_role = 'replica';

-- TRUNCATE TABLE wearable_data CASCADE;
-- TRUNCATE TABLE health_metrics CASCADE;
-- TRUNCATE TABLE symptom_analyses CASCADE;
-- TRUNCATE TABLE ai_insights CASCADE;
-- TRUNCATE TABLE reminders CASCADE;
-- TRUNCATE TABLE medications CASCADE;
-- TRUNCATE TABLE appointments CASCADE;
-- TRUNCATE TABLE health_reports CASCADE;
-- TRUNCATE TABLE family_members CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- Re-enable foreign key checks
-- SET session_replication_role = 'origin';

-- ============================================
-- Verification Queries (Run after cleanup)
-- ============================================

-- Check remaining records in each table
-- SELECT 'users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'family_members', COUNT(*) FROM family_members
-- UNION ALL
-- SELECT 'health_reports', COUNT(*) FROM health_reports
-- UNION ALL
-- SELECT 'appointments', COUNT(*) FROM appointments
-- UNION ALL
-- SELECT 'medications', COUNT(*) FROM medications
-- UNION ALL
-- SELECT 'reminders', COUNT(*) FROM reminders
-- UNION ALL
-- SELECT 'ai_insights', COUNT(*) FROM ai_insights
-- UNION ALL
-- SELECT 'symptom_analyses', COUNT(*) FROM symptom_analyses
-- UNION ALL
-- SELECT 'health_metrics', COUNT(*) FROM health_metrics
-- UNION ALL
-- SELECT 'wearable_data', COUNT(*) FROM wearable_data;

