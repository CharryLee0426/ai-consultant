const {PrismaClient} = require('@prisma/client');

const db = new PrismaClient();

async function main() {
    try {
        await db.category.createMany({
            data: [
                {name: "Famous People"},
                {name: "Movies & TV"},
                {name: "Games"},
                {name: "Musicians"},
                {name: "Animals"},
                {name: "Scientists"},
                {name: "Philosophy"},
            ]
        })
    } catch (e) {
        console.error("Error seeding categories", e)
    } finally {
        await db.$disconnect();
    }
}

main()