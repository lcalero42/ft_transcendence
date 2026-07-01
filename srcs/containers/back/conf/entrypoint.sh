#!/bin/sh
set -e

#install prisma
npm add prisma --save-dev
#add prisma client librairy
npm add prisma @prisma/client @prisma/adapter-pg pg
#genere le code typescript pour nos modele
npx prisma generate
#ajouter la migration des model prisma vers la
# npx prisma migrate dev --name <nom-de-la-migration>

#permettre a typescript de lire le .env
#npm add dotenv



#maybe 
#npm run build

#launch
# npm run start:dev