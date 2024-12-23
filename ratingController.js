const supabase = require('./SupabaseClient'); // Supabase istemcisi

// Rating GET endpoint
const getRatings = async (req, res) => {
    const { bookId } = req.params;

    if (!bookId) {
        return res.status(400).json({ error: 'Book ID is required' });
    }

    try {
        const { data, error } = await supabase
            .from('rating')
            .select('id, user_id, score, book_id')
            .eq('book_id', bookId);

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        // Calculate average rating
        const ratings = data || [];
        const totalRating = ratings.reduce((sum, r) => sum + r.score, 0);
        const averageRating = ratings.length ? totalRating / ratings.length : 0;

        return res.json({
            ratings: ratings,
            averageRating: averageRating
        });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const postRating = async (req, res) => {
    const { bookId, userId, score } = req.body;

    // Validate input
    if (!bookId || !userId || !score) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (score < 1 || score > 5) {
        return res.status(400).json({ error: 'Score must be between 1 and 5' });
    }

    try {
        // Check for existing rating
        const { data: existingRating, error: fetchError } = await supabase
            .from('rating')
            .select('id')
            .eq('book_id', bookId)
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Fetch error:', fetchError);
            return res.status(500).json({ error: 'Error checking existing rating' });
        }

        if (existingRating) {
            // Update existing rating
            const { error: updateError } = await supabase
                .from('rating')
                .update({ score })
                .eq('id', existingRating.id);

            if (updateError) {
                console.error('Update error:', updateError);
                return res.status(500).json({ error: 'Error updating rating' });
            }

            return res.json({ message: 'Rating updated successfully' });
        } else {
            // Insert new rating
            const { error: insertError } = await supabase
                .from('rating')
                .insert([{
                    book_id: bookId,
                    user_id: userId,
                    score: score
                }]);

            if (insertError) {
                console.error('Insert error:', insertError);
                return res.status(500).json({ error: 'Error creating rating' });
            }

            return res.json({ message: 'Rating created successfully' });
        }
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { postRating, getRatings };