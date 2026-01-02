-- Remove admin role from users who should not be admins
-- Only keeping rajdivyanshu86@gmail.com (79dd084c-dd7f-4419-ae3e-090009691f4a) as admin

DELETE FROM public.user_roles 
WHERE role = 'admin' 
AND user_id != '79dd084c-dd7f-4419-ae3e-090009691f4a';