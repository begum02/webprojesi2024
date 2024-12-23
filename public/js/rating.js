document.addEventListener('DOMContentLoaded', () => {
    initializeRating('.ebookrating', '/api/ebook/ratings');
    initializeRating('.audiobookrating', '/api/audiobook/ratings', 'audiobook-average-rating');
});

function initializeRating(containerSelector, apiEndpoint, averageRatingElementId = 'average-rating') {
    const ratingContainer = document.querySelector(containerSelector);
    if (!ratingContainer) return;

    const stars = ratingContainer.querySelectorAll('.star');
    const averageRatingElement = document.getElementById(averageRatingElementId);
    const bookId = ratingContainer.getAttribute('data-book-id');
    const userId = ratingContainer.getAttribute('data-user-id');
    
    let selectedRating = parseInt(localStorage.getItem(`rating_${bookId}_${userId}`)) || 0;

    if (!bookId || !userId) {
        console.error('Missing bookId or userId');
        return;
    }

    // Initial highlight
    highlightStars(selectedRating);

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            highlightStars(parseInt(star.getAttribute('data-value')));
        });

        star.addEventListener('mouseout', () => {
            highlightStars(selectedRating);
        });

        star.addEventListener('click', async () => {
            selectedRating = parseInt(star.getAttribute('data-value'));
            localStorage.setItem(`rating_${bookId}_${userId}`, selectedRating);
            await postRating(selectedRating);
            highlightStars(selectedRating);
            await fetchRatings(bookId);
        });
    });

    function highlightStars(rating) {
        stars.forEach(star => {
            const value = parseInt(star.getAttribute('data-value'));
            star.classList.toggle('selected', value <= rating);
        });
    }

    async function postRating(rating) {
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, userId, score: rating })
            });
            const data = await response.json();
            console.log(data.message);
            await fetchRatings(bookId);
        } catch (error) {
            console.error('Error posting rating:', error);
        }
    }

    async function fetchRatings(bookId) {
        try {
            const response = await fetch(`${apiEndpoint}/${bookId}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            if (!data || !data.ratings) throw new Error('Invalid response format');

            const averageRating = data.averageRating || 0;
            averageRatingElement.textContent = averageRating.toFixed(1);

            const userRating = data.ratings.find(r => r.user_id === parseInt(userId));
            if (userRating) {
                selectedRating = userRating.score;
                highlightStars(selectedRating);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error.message);
            averageRatingElement.textContent = '0.0';
        }
    }

    // Initial fetch
    fetchRatings(bookId);
}