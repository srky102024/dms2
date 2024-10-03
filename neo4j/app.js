const neo4j = require('neo4j-driver');

// Updated Neo4j connection details
const uri = "neo4j+s://184d26be.databases.neo4j.io:7687";  // Neo4j instance URI
const user = "dbms2024";  // Your custom username
const password = "dbms2024";  // Your password

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

// Create flower nodes and relationships with constraints
const createFlowerGraph = async () => {
    try {
        // Step 1: Create a constraint to ensure no duplicate flower names
        await session.run(`
            CREATE CONSTRAINT flower_name_unique IF NOT EXISTS 
            FOR (f:Flower) REQUIRE f.name IS UNIQUE
        `);
        console.log('Constraint for unique flower names created or already exists.');

        // Step 2: Create flower nodes (duplicates will be avoided automatically)
        await session.run(`
            MERGE (:Flower {name: 'Rose'})
            MERGE (:Flower {name: 'Tulip'})
            MERGE (:Flower {name: 'Sunflower'})
            MERGE (:Flower {name: 'Daisy'})
            MERGE (:Flower {name: 'Lily'})
        `);
        console.log('Flower nodes created or already exist.');

        // Step 3: Create unique relationships between flowers
        await session.run(`
            MATCH (r:Flower {name: 'Rose'}), (t:Flower {name: 'Tulip'})
            MERGE (r)-[:NEIGHBOR]->(t)
        `);
        await session.run(`
            MATCH (s:Flower {name: 'Sunflower'}), (d:Flower {name: 'Daisy'})
            MERGE (s)-[:NEIGHBOR]->(d)
        `);
        await session.run(`
            MATCH (l:Flower {name: 'Lily'}), (r:Flower {name: 'Rose'})
            MERGE (l)-[:NEIGHBOR]->(r)
        `);
        console.log('Unique relationships between flowers created or already exist.');

    } catch (error) {
        console.error('Error creating the flower graph:', error);
    } finally {
        await session.close();
        await driver.close();
    }
};

createFlowerGraph();
