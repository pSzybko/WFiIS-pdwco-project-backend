const neo4j = require('neo4j-driver')

const driver = require('../neo4j')

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            const result = await session.run(`
MATCH (u: User)
RETURN u.email
ORDER BY u.email
`)
            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    insertUser: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })

            const result = await session.run(`
MERGE (u: User {email: '${req.body.email}'} )
RETURN u.email`)
            return res.status(201).json({ result: result, status: 'ok' })
        } catch {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    getAllUserMailsSend: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            const sort = req.params.sort == 'false' ? 'DESC' : ''
            const type = req.params.type == 'all' ? '' : `WHERE type.name = '${req.params.type}'`
            const result = await session.run(`
MATCH (u:User {email: '${req.params.user}'})-[:SENDS]->(mail)
WHERE NOT (u)-[:DELETED]->(mail)
MATCH (mail)-[:OF_TYPE]->(type)
MATCH (mail)<-[:RECEIVES]-(u2)
MATCH (mail)-[:SENT]->(date)
`+ type + `
RETURN elementId(mail), mail.title, mail.text, u2.email, date.date
ORDER BY date.date ` + sort
            )
            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    getAllUserMailsReceived: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            const sort = req.params.sort == 'false' ? 'DESC' : ''
            const type = req.params.type == 'all' ? '' : `WHERE type.name = '${req.params.type}'`
            const result = await session.run(`
MATCH (u1:User {email: '${req.params.user}'})-[:RECEIVES]->(mail)
WHERE NOT (u1)-[:DELETED]->(mail)
MATCH (mail)-[:OF_TYPE]->(type)
MATCH (mail)<-[:SENDS]-(u2)
MATCH (mail)-[:SENT]->(date)
`+ type + `
RETURN elementId(mail), mail.title, mail.text, u2.email, date.date
ORDER BY date.date ` + sort
            )
            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    getSpamRecommendation: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            const u1 = req.params.u1
            const u2 = req.params.u2
            const type = req.params.type
            const result = await session.run(`
MATCH(u1:User{email:'${u1}'})-[:DELETED]->(m:Mail)<-[:SENDS]-(u2:User {email: '${u2}'})
WITH u1, u2, count(m) as usunieto
MATCH(u1)-[:DELETED]->(m:Mail)<-[:SENDS]-(u2)
WHERE (m)-[:OF_TYPE]->({name: '${type}'})
WITH u1, u2, count(m) as usunieto_typu, usunieto
MATCH (m2:Mail)
WHERE (u1)-[:RECEIVES]->(m2) AND (u2)-[:SENDS]->(m2) AND (m2)-[:OF_TYPE]->({name: '${type}'})
WITH u1, u2, usunieto_typu, count(m2) as wyslano_typu, usunieto
MATCH (m2:Mail)
WHERE (u1)-[:RECEIVES]->(m2) AND (u2)-[:SENDS]->(m2)
WITH u1, u2, usunieto, count(m2) as wyslano, usunieto_typu, wyslano_typu
RETURN  1.0*wyslano_typu, (1.0*usunieto_typu/wyslano_typu) as perc1, 1.0*wyslano, (1.0*usunieto/wyslano) as perc2
`)
            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
}