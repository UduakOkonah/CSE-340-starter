-- 1. Insert Tony Stark into the account table
INSERT INTO public.account 
(account_firstname, account_lastname, account_email, account_password)
VALUES 
('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- To check the data inserted
-- SELECT * FROM public.account;

--2. Update Tony Stark’s account_type to “Admin”
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- To confirm
-- SELECT account_firstname, account_type FROM public.account;

-- 3. Delete Tony Stark’s record
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- To confirm deletion
-- SELECT * FROM public.account;

--4. Modify the GM Hummer description (use REPLACE)
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- To confirm
-- SELECT inv_make, inv_model, inv_description FROM public.inventory
-- WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. Inner Join to get Sport category vehicles
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
INNER JOIN public.classification AS c
ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

--6. Update file paths in inv_image and inv_thumbnail
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

-- To confirm
-- SELECT inv_image, inv_thumbnail FROM public.inventory;