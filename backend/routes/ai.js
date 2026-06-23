const express = require('express');
const router = express.Router();
const pool = require('../db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/ai/ask - Natural Language Query
router.post('/ask', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        // Fetch small catalog snippet (Title, Author, Category)
        const booksQuery = await pool.query(`
            SELECT b.title, a.first_name || ' ' || a.last_name as author, c.name_slug as category
            FROM BOOKS b
            JOIN AUTHORS a ON b.author_id = a.author_id
            JOIN CATEGORIES c ON b.category_id = c.category_id
            WHERE b.status = 'Available'
        `);
        const catalog = booksQuery.rows.map(b => `- ${b.title} by ${b.author} (${b.category})`).join('\n');

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful Library Assistant. Recommend books based ONLY on the following catalog:\n${catalog}\nIf the catalog doesn't have relevant books, apologize politely.`
                },
                {
                    role: 'user',
                    content: query
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.5,
            max_tokens: 500,
        });

        res.json({ answer: completion.choices[0]?.message?.content || 'I could not process your request.' });
    } catch (err) {
        console.error("AI Ask Error:", err);
        res.status(500).json({ error: 'AI Assistant failed' });
    }
});

// GET /api/ai/recommendations/:userId - Smart Recommendations
router.get('/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user's borrowed books
        const historyQuery = await pool.query(`
            SELECT DISTINCT b.title, c.name_slug as category
            FROM ISSUANCE_LOGS il
            JOIN USERS u ON il.user_identifier_string = u.barcode_id
            JOIN BOOK_ASSET_MAP bam ON il.asset_id = bam.asset_id
            JOIN BOOKS b ON bam.book_id = b.book_id
            JOIN CATEGORIES c ON b.category_id = c.category_id
            WHERE u.id = $1
        `, [userId]);

        const borrowed = historyQuery.rows;
        
        // Fetch full available catalog
        const booksQuery = await pool.query(`
            SELECT b.book_id, b.title, a.first_name || ' ' || a.last_name as author, c.name_slug as category
            FROM BOOKS b
            JOIN AUTHORS a ON b.author_id = a.author_id
            JOIN CATEGORIES c ON b.category_id = c.category_id
            WHERE b.status = 'Available'
        `);

        // Filter out books they already borrowed
        const borrowedTitles = borrowed.map(b => b.title);
        const availableCatalog = booksQuery.rows.filter(b => !borrowedTitles.includes(b.title));

        if (borrowed.length === 0) {
            // No history, return random 3 available books
            return res.json(availableCatalog.slice(0, 3));
        }

        const borrowedContext = borrowed.map(b => `- ${b.title} (${b.category})`).join('\n');
        const catalogContext = availableCatalog.map(b => `[ID: ${b.book_id}] ${b.title} by ${b.author} (${b.category})`).join('\n');

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a recommendation engine. The user has previously borrowed:\n${borrowedContext}\nHere is the available catalog:\n${catalogContext}\nReturn exactly a JSON array of up to 3 book_ids from the catalog that the user would like based on their history. ONLY output the JSON array (e.g. ["BK1001", "BK1003"]). No other text.`
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 150,
        });

        let recommendedIds = [];
        try {
            recommendedIds = JSON.parse(completion.choices[0]?.message?.content.trim());
        } catch(e) {
            console.error("JSON parse failed for Groq response", e);
            recommendedIds = availableCatalog.slice(0, 3).map(b => b.book_id); // fallback
        }

        // Return the actual book objects
        const recommendations = availableCatalog.filter(b => recommendedIds.includes(b.book_id));
        res.json(recommendations);
    } catch (err) {
        console.error("AI Recommendation Error:", err);
        res.status(500).json({ error: 'AI Recommendation failed' });
    }
});

module.exports = router;
