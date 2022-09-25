
export async function importCSV(path)
{
    return await d3.csv(path);
}