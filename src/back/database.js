class database
{
    static fs = require('fs');
    static path = require('path');
    static luxon = require('luxon');

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
            .select("id", "date", "time", "characters", "text_of_immersion_id")
        return response
    }

    static async getImmersion(id)
    {
        let response = await database.knex
            .from("immersions")
            .select("id", "date", "time", "characters", "text_of_immersion_id")
            .where('id', '=', id)
        return response
    }

    static async addImmersion()
    {
        let response = await database.knex
            .from("immersions")
            .insert(
            {
                date: database.luxon.DateTime.now().toFormat('yyyy-LL-dd')
            })
            .returning('id')
        return response;
    }

    static async changeImmersion(id, column, value)
    {
        let response = await database.knex
            .from("immersions")
            .where('id', '=', id)
            .update(column, value);
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

    static async getWorks()
    {
        let response = await database.knex
            .from("works")
            .select("id", "title")
        return response
    }

    static async getWork(id)
    {
        let response = await database.knex
            .from("works")
            .select("id", "title")
            .where('id', '=', id)
        return response
    }

    static async addWork()
    {
        let response = await database.knex
            .from("works")
            .insert(
            {
                title: "新しい作品"
            })
            .returning('id')
        return response;
    }

    static async changeWork(id, column, value)
    {
        let response = await database.knex
            .from("works")
            .where('id', '=', id)
            .update(column, value);
            return response
    }

    static async deleteWork(id)
    {
        let response = await database.knex
            .from("works")
            .where({ id: id })
            .del()
        return response
    }
}

exports.database = database