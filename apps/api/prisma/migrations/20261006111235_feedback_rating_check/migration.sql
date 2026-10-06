-- Contrainte non exprimable dans le schéma Prisma : note entre 1 et 5.
ALTER TABLE "Feedback" ADD CONSTRAINT "rating_range" CHECK ("rating" BETWEEN 1 AND 5);