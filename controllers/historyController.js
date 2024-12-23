const supabase = require('../SupabaseClient'); // Supabase client'ını içe aktar

// Kullanıcının okuma geçmişini listeleme
const getReadingHistory = async (userId) => {
    try {
        // Ensure userId is an integer
        const numericUserId = parseInt(userId);
        
        if (isNaN(numericUserId)) {
            throw new Error('Invalid user ID');
        }

        const { data, error } = await supabase
            .from('reading_history')
            .select(`
                book_id,
                last_read,
                book:book_id (
                    id,
                    title,
                    author:author_id (
                        name
                    ),
                    cover_image
                )
            `)
            .eq('user_id', numericUserId)
            .order('last_read', { ascending: false });

        if (error) throw error;
        
        const transformedData = data?.map(item => ({
            id: item.book.id,
            title: item.book.title,
            author: item.book.author?.name,
            cover_image: item.book.cover_image,
            last_read: item.last_read
        })) || [];

        return transformedData;
    } catch (err) {
        console.error('Error fetching reading history:', err);
        throw err;
    }
};

// Yeni bir okuma geçmişi kaydı eklemek
const addReadingHistory = async (req, res) => {
    try {
        const { user_id, book_id } = req.body;

        if (!user_id || !book_id) {
            return res.status(400).json({ error: "User ID and Book ID are required" });
        }

        const { error } = await supabase
            .from('reading_history')
            .insert([{ user_id, book_id }]);

        if (error) throw error;

        res.status(200).json({ message: "Reading history added successfully" });
    } catch (err) {
        console.error('Error adding reading history:', err);
        res.status(500).json({ error: "Failed to add reading history" });
    }
};

// Kullanıcının dinleme geçmişini listeleme
const getListeningHistory = async (userId) => {
    try {
        // Ensure userId is an integer
        const numericUserId = parseInt(userId);
        
        if (isNaN(numericUserId)) {
            throw new Error('Invalid user ID');
        }

        const { data, error } = await supabase
            .from('listening_history')
            .select(`
                book_id,
                last_listened,
                audio_book:book_id (
                    id,
                    title,
                    author:author_id (
                        name
                    ),
                    cover_image
                )
            `)
            .eq('user_id', numericUserId)
            .order('last_listened', { ascending: false });

        if (error) throw error;

        const transformedData = data?.map(item => ({
            id: item.audio_book.id,
            title: item.audio_book.title,
            author: item.audio_book.author?.name,
            cover_image: item.audio_book.cover_image,
            last_listened: item.last_listened
        })) || [];

        return transformedData;
    } catch (err) {
        console.error('Error fetching listening history:', err);
        throw err;
    }
};

// Yeni bir dinleme geçmişi kaydı eklemek
const addListeningHistory = async (req, res) => {
    try {
        const { user_id, book_id } = req.body;

        if (!user_id || !book_id) {
            return res.status(400).json({ error: "User ID and Book ID are required" });
        }

        const { error } = await supabase
            .from('listening_history')
            .insert([{ user_id, book_id }]);

        if (error) throw error;

        res.status(200).json({ message: "Listening history added successfully" });
    } catch (err) {
        console.error('Error adding listening history:', err);
        res.status(500).json({ error: "Failed to add listening history" });
    }
};

// Controller fonksiyonlarını dışa aktar
module.exports = {
    getReadingHistory,
    addReadingHistory,
    getListeningHistory,
    addListeningHistory
};
