document.addEventListener('DOMContentLoaded', () => {
    const audiobookBtns = document.querySelectorAll('.audiobook-btn');

    audiobookBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const bookId = btn.closest('.audiobook-item').dataset.id;
            if (bookId) {
                window.location.href = `/audio_book_detail/${bookId}`;
            }
        });
    });
});