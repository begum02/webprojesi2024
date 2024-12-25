document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.querySelector('audio');
    const bookId = window.location.pathname.split('/').pop();

    if (audioPlayer) {
        audioPlayer.addEventListener('play', async () => {
            try {
                const response = await fetch('/api/history/listening', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        book_id: bookId
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to update listening history');
                }
            } catch (error) {
                console.error('Error updating listening history:', error);
            }
        });
    }

    const favoriteBtn = document.querySelector('.favorite-btn');
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', async () => {
            try {
                const bookId = favoriteBtn.dataset.bookId;
                const response = await fetch('/api/favorites/toggle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ book_id: bookId })
                });

                if (!response.ok) throw new Error('Network response was not ok');
                
                const data = await response.json();
                favoriteBtn.textContent = data.isFavorite ? 'Favorilerden Kaldır' : 'Favorilere Ekle';
                favoriteBtn.dataset.isFavorite = data.isFavorite;
                
            } catch (error) {
                console.error('Error:', error);
                alert('Favori işlemi başarısız oldu.');
            }
        });
    }
});