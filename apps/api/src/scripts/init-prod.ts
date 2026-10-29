import * as argon2 from "argon2"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client.js"

//Donnée de référence (identiques au seed, sans les comptes de test)
const CATEGORIES = ["Développement", "DevOps", "Architecture", "Réseaux"];
const PRIORITIES = [
    { 
        label: "Urgent",
        level: 1,
        targetHours: 4
    },
    { 
        label: "Haute",
        level: 2,
        targetHours: 24
    },
    { 
        label: "Normal",
        level: 3,
        targetHours: 72
    },
    { 
        label: "Faible",
        level: 4,
        targetHours: 168
    },
];

async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if(!databaseUrl) throw new Error ("DATABASE_URL manquante");

    const prisma = new PrismaClient({ adapter: new PrismaPg({connectionString: databaseUrl})})

    try {
        // 1. Doonée de référence (idempotent)
        for (const name of CATEGORIES) {
            await prisma.category.upsert({ where: { name }, update: {}, create: { name }});
        }
        for (const priority of PRIORITIES) {
            await prisma.priority.upsert({
                where: { label: priority.label },
                update: {},
                create: priority,
            });
        }

        console.log("Catégories et priorités en place");

        //2. Premier administrateur, uniquement s'il n'en existe aucun
        const adminCount = await prisma.user.count({ where: { role: "ADMIN"}})
        if(adminCount > 0){
            console.log("Un administrateur existe déjà : aucun compte créé");
            return;
        }

        const { ADMIN_EMAIL: email, ADMIN_NAME: name, ADMIN_PASSWORD: password } = process.env;
        if(!email || !name || !password) {
            throw new Error("ADMIN_EMAIL, ADMIN_NAME et ADMIN_PASSWORD sont requis pour créer le premier administrateur")
        }
        if(password.length < 12 ) {
            throw new Error("Le mot de passe administrateur doit contenir au moins 12 caractères")
        }

        await prisma.user.create({
            data: {
                email: email.trim().toLowerCase(),
                name,
                role: "ADMIN",
                passwordHash: await argon2.hash(password),
            }
        })
        console.log(`Administrateur créé : ${email.trim().toLowerCase()}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((err) => {
    console.error("❌", err instanceof Error ? err.message : err);
    process.exit(1);    // code d'erreur : utile pour les scirpts et la CI
});