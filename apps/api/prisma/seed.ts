import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
    // Mot de passe de DEVELOPPEMENT uniquement - jamais en production
    const passwordHash = await argon2.hash("DEVELOPPEMENT");

    const employe = await prisma.user.upsert({
        where: { email: "employe@techticket.local" },
        update: {},
        create: {
            name: "Emilie Employee",
            email: "employe@techticket.local",
            passwordHash,
            role: "EMPLOYE",
        },
    });

    const tech = await prisma.user.upsert({
        where: { email: "tech@techticket.local" },
        update: {},
        create: {
            name: "Jean-Michel Tech",
            email: "tech@techticket.local",
            passwordHash,
            role: "TECH",
        },
    });

    await prisma.user.upsert({
        where: { email: "admin@techticket.local" },
        update: {},
        create: {
            name: "Lancelot Admin",
            email: "admin@techticket.local",
            passwordHash,
            role: "ADMIN",
        },
    });

    const developpement = await prisma.category.upsert({
        where: { name: "Développement" },
        update: {},
        create: {
            name: "Développement",
            active: true,
        },
    });

    await prisma.category.upsert({
        where: { name: "DevOps" },
        update: {},
        create: {
            name: "DevOps",
            active: true,
        },
    });

    await prisma.category.upsert({
        where: { name: "Architecture" },
        update: {},
        create: {
            name: "Architecture",
            active: true,
        },
    });

    const reseaux = await prisma.category.upsert({
        where: { name: "Réseaux" },
        update: {},
        create: {
            name: "Réseaux",
            active: true,
        },
    });

    const urgent = await prisma.priority.upsert({
        where: { label: "Urgent" },
        update: {},
        create: {
            label: "Urgent",
            level: 1,
            targetHours: 4,
        },
    });

    const haute = await prisma.priority.upsert({
        where: { label: "Haute" },
        update: {},
        create: {
            label: "Haute",
            level: 2,
            targetHours: 24,
        },
    });

    const normal = await prisma.priority.upsert({
        where: { label: "Normal" },
        update: {},
        create: {
            label: "Normal",
            level: 3,
            targetHours: 72,
        },
    });

    await prisma.priority.upsert({
        where: { label: "Faible" },
        update: {},
        create: {
            label: "Faible",
            level: 4,
            targetHours: 168,
        },
    });

    await prisma.ticket.upsert({
        where: { number: "TT-2026-00001" },
        update: {},
        create: {
            number: "TT-2026-00001",
            title: "Plus d'accès au wifi",
            description: "Plus d'accès au wifi",
            status: "OUVERT",
            requesterId: employe.id,
            categoryId: reseaux.id,
            priorityId: urgent.id,
        },
    });

    const excel = await prisma.ticket.upsert({
        where: { number: "TT-2026-00002" },
        update: {},
        create: {
            number: "TT-2026-00002",
            title: "Excel plante à l'ouverture",
            description: "Excel plante à l'ouverture",
            status: "EN_COURS",
            requesterId: employe.id,
            assigneeId: tech.id,
            categoryId: developpement.id,
            priorityId: haute.id,
        },
    });

    // Pas de clé unique sur Comment : on ne crée les commentaires que s'il n'y en a pas déjà
    if ((await prisma.comment.count({ where: { ticketId: excel.id } })) === 0) {
        await prisma.comment.createMany({
            data: [
                {
                    ticketId: excel.id,
                    authorId: tech.id,
                    content: "Bonjour, pouvez-vous m'indiquer le message d'erreur affiché au démarrage d'Excel ?",
                },
                {
                    ticketId: excel.id,
                    authorId: tech.id,
                    content: "Probable conflit avec un complément Office. Tester un démarrage en mode sans échec (excel /safe).",
                    internal: true,
                },
            ],
        });
    }

    await prisma.ticket.upsert({
        where: { number: "TT-2026-00003" },
        update: {},
        create: {
            number: "TT-2026-00003",
            title: "Problème de connexion au serveur",
            description: "Problème de connexion au serveur",
            status: "EN_ATTENTE_RETOUR",
            requesterId: employe.id,
            assigneeId: tech.id,
            categoryId: reseaux.id,
            priorityId: normal.id,
        },
    });

    await prisma.ticket.upsert({
        where: { number: "TT-2026-00004" },
        update: {},
        create: {
            number: "TT-2026-00004",
            title: "Souris qui ne fonctionne plus",
            description: "Souris qui ne fonctionne plus",
            status: "RESOLU",
            requesterId: employe.id,
            assigneeId: tech.id,
            categoryId: developpement.id,
            priorityId: normal.id,
            resolvedAt: new Date(),
            solution: "Souris remplacée",
        },
    });

    await prisma.ticket.upsert({
        where: { number: "TT-2026-00005" },
        update: {},
        create: {
            number: "TT-2026-00005",
            title: "Ecran qui ne s'allume plus",
            description: "Ecran qui ne s'allume plus",
            status: "FERME",
            requesterId: employe.id,
            assigneeId: tech.id,
            categoryId: developpement.id,
            priorityId: normal.id,
            resolvedAt: new Date(),
            solution: "Câble d'alimentation de l'écran remplacé",
        },
    });

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
