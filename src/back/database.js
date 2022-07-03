class database
{
    static fs = require('fs');
    static path = require('path');

    static rootPath = process.env.INIT_CWD
    static defaultDBPath = "./user_data/immersion.sqlite"
    static defaultSchemaPath = "./src/back/db/immersion.db.sql"
    static knex = undefined;


    static async tryConnect()
    {
        var dbPath = database.path.join(database.rootPath, database.defaultDBPath);
        if (database.fs.existsSync(dbPath)) 
        {
            database.connect()
        }
        else
        {
            database.createAndConnect()
        }
    }

    static async createAndConnect()
    {
        database.connect()

        let sql = database.fs.readFileSync(database.path.join(database.rootPath, database.defaultSchemaPath), "utf8");
        console.log(sql)
        
        console.log(database.query(sql))
    }

    static async connect()
    {
        database.knex = require('knex')
        (
            {
                client: 'sqlite3',
                connection: 
                {
                    filename: database.defaultDBPath,
                    multipleStatements: true
                }
            }
        );
        
    }

    static async query(input)
    {
        return await database.knex.raw(input);
    }
}

exports.database = database