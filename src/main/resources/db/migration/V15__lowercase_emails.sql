-- Les adresses sont desormais normalisees en minuscules a l'entree (Emails.normalize).
-- Hibernate lie le parametre de recherche en varchar : une adresse stockee avec des
-- majuscules ne serait plus retrouvee. Aucun doublon possible : la contrainte citext
-- interdisait deja deux adresses ne differant que par la casse.
-- Comparaison en text : en citext, email <> lower(email) serait toujours faux.
UPDATE users SET email = lower(email::text) WHERE email::text <> lower(email::text);
