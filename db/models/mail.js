const neo4j = require('neo4j-driver')

const driver = require('../neo4j')


module.exports = {
    insertMail: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            var date = new Date()
            // date.setDate(date.getDate() - 1)
            date = date.toLocaleDateString("pl-PL")
            const result = await session.run(`
CREATE (m:Mail {title: '${req.body.title}', text: '${req.body.text}'} )
MERGE (u1:User { email: '${req.body.senderMail}' })
MERGE (u2:User { email: '${req.body.recipientMail}' })
MERGE (t:Type { name: '${req.body.type}' })
MERGE (d: Date {date: '${date}'})

MERGE (m)-[:OF_TYPE]->(t)
MERGE (m)-[:SENT]->(d)


MERGE (u1)-[:SENDS]->(m)
MERGE (u2)-[:RECEIVES]->(m)

RETURN m, u1, u2, t, d`)

            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    insertReply: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            var date = new Date()
            // date.setDate(date.getDate() - 1) 
            date = date.toLocaleDateString("pl-PL")
            const text = req.body.text
            const id = req.body.id

            const result = await session.run(`
MATCH (m1:Mail)
WHERE elementId(m1) = '${id}'

MATCH (u1:User)-[:SENDS]->(m1)
MATCH (u2:User)-[:RECEIVES]->(m1)

MATCH (m1)-[:OF_TYPE]->(type)

CREATE (m2:Mail {title: 'Re: '+m1.title, text: '${text}'} )
MERGE (t:Type { name: type.name })
MERGE (d: Date {date: '${date}'})

MERGE (m2)-[:OF_TYPE]->(t)
MERGE (m2)-[:SENT]->(d)


MERGE (u2)-[:SENDS]->(m2)
MERGE (u1)-[:RECEIVES]->(m2)

MERGE (m2)-[:REPLIES_TO]->(m1)

RETURN m2`)

            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    getOneMail: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            const id = req.params.id

            const result = await session.run(`
MATCH (m:Mail)
WHERE elementId(m) = '${id}'
MATCH (m)<-[:SENDS]-(u1)
MATCH (m)<-[:RECEIVES]-(u2)
MATCH (m)-[:SENT]->(date)
MATCH (m)-[:OF_TYPE]->(type)
RETURN m.title, m.text, u1.email, u2.email, date.date, type.name
            `)
            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    deleteOneMail: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            const id = req.params.id

            const result = await session.run(`
MATCH (m:Mail)
WHERE elementId(m) = '${id}'
DETACH DELETE m
            `)
            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
    deleteOneMailRelation: async (req, res) => {
        try {
            const session = driver.session({ database: 'neo4j' })
            const id = req.params.id
            const email = req.params.user

            const result = await session.run(`
MATCH (m:Mail)-[r]-(u: User {email: '${email}'})
WHERE elementId(m) = '${id}'
MERGE (u)-[:DELETED]->(m)
            `)
            return res.status(201).json({ result: result, status: 'ok' })
        } catch (err) {
            return res.status(422).json({ status: 'error', error: err.message })
        }
    },
}