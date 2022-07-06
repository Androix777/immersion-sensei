class database
{
    static fs = require('fs');
    static path = require('path');

    static rootPath = process.env.INIT_CWD
    static defaultDBPath = "./user_data/immersion.sqlite"
    static defaultTemplatePath = "./src/back/db/immersion.sqlite"
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
        database.fs.copyFile(database.path.join(database.rootPath, database.defaultTemplatePath), database.path.join(database.rootPath, database.defaultDBPath), 
            (err) => { if (err) throw err; });
        
        database.connect();
        
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
        let response = await database.knex.raw(input);
        return response
    }

    static async getImmersions()
    {
        let response = await database.knex
            .from("immersions")
            .select("id", "date", "time", "characters")
        return response
    }

    static async deleteImmersion(id)
    {
        let response = await database.knex
            .from("immersions")
            .where({ id: id })
            .del()
        return response
    }
}

exports.database = database