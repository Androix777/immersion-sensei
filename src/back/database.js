const fs = require('fs');
const path = require('path');
const luxon = require('luxon');
const { start } = require('repl');


class database
{
    static rootPath = process.env.INIT_CWD
    static defaultDBPath = "./user_data/immersion.sqlite"
    static defaultTemplatePath = "./src/back/db/immersion.sqlite"
    static knex = undefined;


    static async tryConnect()
    {
        var dbPath = path.join(database.rootPath, database.defaultDBPath);
        if (fs.existsSync(dbPath)) 
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
        fs.copyFile(path.join(database.rootPath, database.defaultTemplatePath), database.path.join(database.rootPath, database.defaultDBPath), 
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
                    multipleStatements: true,
                },
                pool:
                {
                    afterCreate: (conn, cb) => conn.run('PRAGMA foreign_keys = ON', cb)
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
        var response = await database.knex
            .from("immersions")
            .select("id", "date", "time", "characters", "text_of_immersion_id", "work_id", "tag_id")
            .leftJoin('immersions_tags', 'immersions.id', 'immersions_tags.immersion_id')

        var response = response.reduce((result, row) => 
        {
            result[row.id] = result[row.id] || 
            {
                id: row.id,
                date: row.date,
                time: row.time,
                characters: row.characters,
                text_of_immersion_id: row.text_of_immersion_id,
                work_id: row.work_id,
                tags: [],
            };
        
            result[row.id].tags.push(row.tag_id);
            return result;
        }, []).filter(n => n);

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
                date: luxon.DateTime.now().toFormat('yyyy-LL-dd')
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

    static async importImmersions(data)
    {
        let response = await database.knex
            .from("immersions")
            .insert(data)
            .returning('id')
        return response;
    }

    static async getWorks()
    {
        let response = await database.knex
            .from("works")
            .select("id", "title", "color", "type_id")
        return response
    }

    static async getWork(id)
    {
        let response = await database.knex
            .from("works")
            .select("id", "title", "color", "type_id")
            .where('id', '=', id)
        return response
    }

    static async addWork()
    {
        let response = await database.knex
            .from("works")
            .insert(
            {
                title: "新しい作品",
                color: "#555555"
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

    static async importWorks(data)
    {
        let response = await database.knex
            .from("works")
            .insert(data)
            .returning('id')
        return response;
    }

    static async getWorkTypes()
    {
        let response = await database.knex
            .from("types_of_works")
            .select("id", "name")
        return response
    }

    static async getWorkType(id)
    {
        let response = await database.knex
            .from("types_of_works")
            .select("id", "name")
            .where('id', '=', id)
        return response
    }

    static async addWorkType()
    {
        let response = await database.knex
            .from("types_of_works")
            .insert(
            {
                name: "タイプ"
            })
            .returning('id')
        return response;
    }

    static async changeWorkType(id, column, value)
    {
        let response = await database.knex
            .from("types_of_works")
            .where('id', '=', id)
            .update(column, value);
            return response
    }

    static async deleteWorkType(id)
    {
        let response = await database.knex
            .from("types_of_works")
            .where({ id: id })
            .del()
        return response
    }

    static async getTags()
    {
        let response = await database.knex
            .from("tags")
            .select("id", "name")
        return response
    }

    static async getTag(id)
    {
        let response = await database.knex
            .from("tags")
            .select("id", "name")
            .where('id', '=', id)
        return response
    }

    static async addTag()
    {
        let response = await database.knex
            .from("tags")
            .insert(
            {
                name: "タッグ"
            })
            .returning('id')
        return response;
    }

    static async changeTag(id, column, value)
    {
        let response = await database.knex
            .from("tags")
            .where('id', '=', id)
            .update(column, value);
            return response
    }

    static async deleteTag(id)
    {
        let response = await database.knex
            .from("tags")
            .where({ id: id })
            .del()
        return response
    }

    static async importTags(data)
    {
        let response = await database.knex
            .from("tags")
            .insert(data)
            .returning('id')
        return response;
    }

    static async addImmersionTagLinks(immersionID, tagIDList)
    {
        var insertList = [];
        tagIDList.forEach(
            element =>
            {
                insertList.push({immersion_id: immersionID, tag_id: element});
            }
        );
        let response = await database.knex
            .from("immersions_tags")
            .insert(insertList)
            .returning('immersion_id')
        return response;
    }

    static async deleteImmersionTagLinks(id)
    {
        let response = await database.knex
            .from("immersions_tags")
            .where({ immersion_id: id })
            .del()
        return response;
    }

    static async getImmersionText(id)
    {
        let response = await database.knex
            .from("texts_of_immersions")
            .where({ id: id })
            .select('text')
        return response;
    }

    static async addImmersionText(text)
    {
        let response = await database.knex
            .from("texts_of_immersions")
            .insert(
            {
                text: text
            })
            .returning('id')
        return response;
    }

    static async changeImmersionText(id, text)
    {
        let response = await database.knex
            .from("texts_of_immersions")
            .where({ id: id})
            .update(
            {
                text: text
            })
        return response;
    }

    static async deleteImmersionText(id)
    {
        let response = await database.knex
            .from("texts_of_immersions")
            .where({ id: id })
            .del()
        return response;
    }

    static async searchImmersionTexts(searchText)
{
    var startTime = performance.now();
    let response = await database.knex
        .from("texts_of_immersions")
        .whereLike('text', '%'+ searchText +'%')
        .select('id');
    var endTime = performance.now()
    console.log(`${endTime - startTime} milliseconds search`);
    console.log(response);
    return response;
}

    //Test data
    static async addData()
    {
        var textsFolder = '';
        var textFiles = await fs.promises.readdir(textsFolder);
        
        var currentDate = luxon.DateTime.now();
        var index = 0;

        var subArray = textFiles.slice(0,90000);
        for(var textFile in subArray)
        {
            var text = await fs.promises.readFile(path.join(textsFolder, subArray[textFile]), "utf8");
            var textID = await database.addImmersionText(text);
            await database.knex
            .from("immersions")
            .insert(
            {
                text_of_immersion_id: textID,
                time: 3600,
                characters: text.length,
                date: currentDate.plus({ days: (index/25>>0) }).toFormat('yyyy-LL-dd')
            })

            index++;
            console.log(index);
        };
    }
}

exports.database = database