-- AEI Portal — numéro de contact pour les colocations et produits Marketplace.
-- À exécuter après 12_administration_trust.sql.

alter table public.housing_listings
  add column if not exists contact_phone text;

alter table public.marketplace_products
  add column if not exists contact_phone text;

alter table public.housing_listings
  drop constraint if exists housing_contact_phone_format;
alter table public.housing_listings
  add constraint housing_contact_phone_format
  check (contact_phone is null or char_length(trim(contact_phone)) between 8 and 24);

alter table public.marketplace_products
  drop constraint if exists marketplace_contact_phone_format;
alter table public.marketplace_products
  add constraint marketplace_contact_phone_format
  check (contact_phone is null or char_length(trim(contact_phone)) between 8 and 24);

grant insert (contact_phone), update (contact_phone)
on public.housing_listings to authenticated;

grant insert (contact_phone), update (contact_phone)
on public.marketplace_products to authenticated;

notify pgrst, 'reload schema';
