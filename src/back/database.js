class database
{
    static knex = undefined;

    static async connect()
    {
        database.knex = require('knex')
        (
            {
                client: 'sqlite3',
                connection: 
                {
                    filename: "./immersion.sqlite"
                }
            }
        );
        
    }
    static async query(input)
    {
        console.log(await database.knex.raw(input));
    }
}

exports.database = database